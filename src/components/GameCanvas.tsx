import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Player, TreasureBox } from '../types/game';

interface GameCanvasProps {
  player: Player;
  onPlayerMove: (x: number, y: number) => void;
  onTreasureBoxInteract: (boxId: string) => void;
  treasureBoxes: TreasureBox[];
  hintsEnabled: boolean;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  player,
  onPlayerMove,
  onTreasureBoxInteract,
  treasureBoxes,
  hintsEnabled
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const playerMeshRef = useRef<THREE.Group>();
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const mouseRef = useRef({ x: 0, y: 0, isLocked: false });
  const velocityRef = useRef({ x: 0, y: 0, z: 0 });
  const [isJumping, setIsJumping] = useState(false);
  const [nearTreasure, setNearTreasure] = useState<TreasureBox | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup with enhanced atmosphere
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 50, 300);
    sceneRef.current = scene;

    // Camera setup - Third person with better positioning
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 10, 15);
    cameraRef.current = camera;

    // Enhanced renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x87CEEB);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Enhanced lighting system
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(100, 150, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 600;
    directionalLight.shadow.camera.left = -200;
    directionalLight.shadow.camera.right = 200;
    directionalLight.shadow.camera.top = 200;
    directionalLight.shadow.camera.bottom = -200;
    scene.add(directionalLight);

    // Add rim lighting for atmosphere
    const rimLight = new THREE.DirectionalLight(0x87CEEB, 0.5);
    rimLight.position.set(-50, 50, -50);
    scene.add(rimLight);

    // Enhanced ground with multiple textures
    const groundGeometry = new THREE.PlaneGeometry(500, 500, 100, 100);
    
    // Create procedural ground texture
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // Base grass color
    ctx.fillStyle = '#2E8B37';
    ctx.fillRect(0, 0, 512, 512);
    
    // Add grass patches
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const size = Math.random() * 8 + 2;
      ctx.fillStyle = `hsl(${100 + Math.random() * 40}, ${50 + Math.random() * 30}%, ${25 + Math.random() * 20}%)`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Add dirt patches
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const size = Math.random() * 15 + 5;
      ctx.fillStyle = `hsl(${30 + Math.random() * 20}, ${40 + Math.random() * 20}%, ${20 + Math.random() * 15}%)`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    const groundTexture = new THREE.CanvasTexture(canvas);
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(25, 25);
    
    const groundMaterial = new THREE.MeshLambertMaterial({ 
      map: groundTexture,
      color: 0xffffff
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    
    // Add vertex displacement for terrain variation
    const vertices = ground.geometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
      vertices[i + 2] = Math.sin(vertices[i] * 0.01) * Math.cos(vertices[i + 1] * 0.01) * 2;
    }
    ground.geometry.attributes.position.needsUpdate = true;
    ground.geometry.computeVertexNormals();
    
    scene.add(ground);

    // Enhanced tree creation with more variety
    const createTree = (x: number, z: number, scale: number = 1, treeType: number = 0) => {
      const treeGroup = new THREE.Group();
      
      if (treeType === 0) {
        // Palm tree
        const trunkGeometry = new THREE.CylinderGeometry(0.6 * scale, 1.0 * scale, 15 * scale, 8);
        const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 7.5 * scale;
        trunk.castShadow = true;
        treeGroup.add(trunk);

        // Palm fronds
        for (let i = 0; i < 8; i++) {
          const frondGeometry = new THREE.CylinderGeometry(0.1, 0.3, 8 * scale);
          const frondMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
          const frond = new THREE.Mesh(frondGeometry, frondMaterial);
          frond.position.set(0, 15 * scale, 0);
          frond.rotation.z = (i / 8) * Math.PI * 2;
          frond.rotation.x = Math.PI / 6;
          frond.castShadow = true;
          treeGroup.add(frond);
        }
      } else {
        // Regular tree with multiple leaf layers
        const trunkGeometry = new THREE.CylinderGeometry(0.8 * scale, 1.2 * scale, 12 * scale, 8);
        const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 6 * scale;
        trunk.castShadow = true;
        treeGroup.add(trunk);

        // Multiple layers of leaves
        const leafColors = [0x006400, 0x228B22, 0x32CD32, 0x9ACD32];
        const leafSizes = [6, 4.5, 3.5, 2.5];
        const leafHeights = [14, 16, 18, 20];
        
        for (let i = 0; i < 4; i++) {
          const leavesGeometry = new THREE.SphereGeometry(leafSizes[i] * scale, 8, 6);
          const leavesMaterial = new THREE.MeshLambertMaterial({ color: leafColors[i] });
          const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
          leaves.position.set(
            (Math.random() - 0.5) * 2 * scale,
            leafHeights[i] * scale,
            (Math.random() - 0.5) * 2 * scale
          );
          leaves.castShadow = true;
          treeGroup.add(leaves);
        }
      }

      treeGroup.position.set(x, 0, z);
      return treeGroup;
    };

    // Create diverse jungle with different tree types
    for (let i = 0; i < 200; i++) {
      const x = (Math.random() - 0.5) * 450;
      const z = (Math.random() - 0.5) * 450;
      const scale = 0.6 + Math.random() * 1.2;
      const treeType = Math.floor(Math.random() * 2);
      
      if (Math.sqrt(x * x + z * z) > 20) {
        scene.add(createTree(x, z, scale, treeType));
      }
    }

    // Add environmental elements
    const createBush = (x: number, z: number) => {
      const bushGroup = new THREE.Group();
      const bushGeometry = new THREE.SphereGeometry(2 + Math.random() * 2, 8, 6);
      const bushMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
      const bush = new THREE.Mesh(bushGeometry, bushMaterial);
      bush.position.y = 1;
      bush.scale.y = 0.6;
      bush.castShadow = true;
      bush.receiveShadow = true;
      bushGroup.add(bush);
      bushGroup.position.set(x, 0, z);
      return bushGroup;
    };

    // Add bushes
    for (let i = 0; i < 100; i++) {
      const x = (Math.random() - 0.5) * 400;
      const z = (Math.random() - 0.5) * 400;
      if (Math.sqrt(x * x + z * z) > 15) {
        scene.add(createBush(x, z));
      }
    }

    // Enhanced rocks with variety
    for (let i = 0; i < 80; i++) {
      const rockTypes = [
        () => new THREE.DodecahedronGeometry(1 + Math.random() * 3),
        () => new THREE.OctahedronGeometry(1 + Math.random() * 2.5),
        () => new THREE.IcosahedronGeometry(1 + Math.random() * 2)
      ];
      
      const rockGeometry = rockTypes[Math.floor(Math.random() * rockTypes.length)]();
      const rockMaterial = new THREE.MeshLambertMaterial({ 
        color: new THREE.Color().setHSL(0, 0, 0.3 + Math.random() * 0.3)
      });
      const rock = new THREE.Mesh(rockGeometry, rockMaterial);
      
      const x = (Math.random() - 0.5) * 350;
      const z = (Math.random() - 0.5) * 350;
      
      if (Math.sqrt(x * x + z * z) > 12) {
        rock.position.set(x, Math.random() * 3, z);
        rock.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        );
        rock.castShadow = true;
        rock.receiveShadow = true;
        scene.add(rock);
      }
    }

    // Enhanced student character model
    const createStudentCharacter = () => {
      const studentGroup = new THREE.Group();
      
      // Body with school uniform
      const bodyGeometry = new THREE.CylinderGeometry(1.2, 1.4, 3.5, 8);
      const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x4169E1 });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.position.y = 2.75;
      body.castShadow = true;
      studentGroup.add(body);
      
      // School tie
      const tieGeometry = new THREE.BoxGeometry(0.3, 2, 0.1);
      const tieMaterial = new THREE.MeshLambertMaterial({ color: 0x8B0000 });
      const tie = new THREE.Mesh(tieGeometry, tieMaterial);
      tie.position.set(0, 3.5, 1.2);
      tie.castShadow = true;
      studentGroup.add(tie);
      
      // Head with better proportions
      const headGeometry = new THREE.SphereGeometry(1, 16, 12);
      const headMaterial = new THREE.MeshLambertMaterial({ color: 0xFFDBAE });
      const head = new THREE.Mesh(headGeometry, headMaterial);
      head.position.y = 5.5;
      head.castShadow = true;
      studentGroup.add(head);
      
      // Hair
      const hairGeometry = new THREE.SphereGeometry(1.1, 16, 12);
      const hairMaterial = new THREE.MeshLambertMaterial({ color: 0x4A4A4A });
      const hair = new THREE.Mesh(hairGeometry, hairMaterial);
      hair.position.set(0, 5.8, 0);
      hair.scale.set(1, 0.8, 1);
      hair.castShadow = true;
      studentGroup.add(hair);
      
      // Eyes with better detail
      const eyeGeometry = new THREE.SphereGeometry(0.15, 8, 6);
      const eyeMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
      
      const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
      leftEye.position.set(-0.35, 5.6, 0.8);
      studentGroup.add(leftEye);
      
      const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
      rightEye.position.set(0.35, 5.6, 0.8);
      studentGroup.add(rightEye);
      
      // Nose
      const noseGeometry = new THREE.ConeGeometry(0.1, 0.3, 6);
      const noseMaterial = new THREE.MeshLambertMaterial({ color: 0xFFDBAE });
      const nose = new THREE.Mesh(noseGeometry, noseMaterial);
      nose.position.set(0, 5.3, 0.9);
      nose.rotation.x = Math.PI;
      studentGroup.add(nose);
      
      // Enhanced backpack with details
      const backpackGeometry = new THREE.BoxGeometry(1.8, 2.5, 1);
      const backpackMaterial = new THREE.MeshLambertMaterial({ color: 0x8B0000 });
      const backpack = new THREE.Mesh(backpackGeometry, backpackMaterial);
      backpack.position.set(0, 3.5, -1.5);
      backpack.castShadow = true;
      studentGroup.add(backpack);
      
      // Backpack straps
      const strapGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3);
      const strapMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
      
      const leftStrap = new THREE.Mesh(strapGeometry, strapMaterial);
      leftStrap.position.set(-0.6, 4, -0.8);
      leftStrap.rotation.x = Math.PI / 6;
      studentGroup.add(leftStrap);
      
      const rightStrap = new THREE.Mesh(strapGeometry, strapMaterial);
      rightStrap.position.set(0.6, 4, -0.8);
      rightStrap.rotation.x = Math.PI / 6;
      studentGroup.add(rightStrap);
      
      // Arms with sleeves
      const armGeometry = new THREE.CylinderGeometry(0.35, 0.4, 2.5, 8);
      const armMaterial = new THREE.MeshLambertMaterial({ color: 0xFFDBAE });
      
      const leftArm = new THREE.Mesh(armGeometry, armMaterial);
      leftArm.position.set(-1.8, 3, 0);
      leftArm.castShadow = true;
      studentGroup.add(leftArm);
      
      const rightArm = new THREE.Mesh(armGeometry, armMaterial);
      rightArm.position.set(1.8, 3, 0);
      rightArm.castShadow = true;
      studentGroup.add(rightArm);
      
      // Hands
      const handGeometry = new THREE.SphereGeometry(0.3, 8, 6);
      const handMaterial = new THREE.MeshLambertMaterial({ color: 0xFFDBAE });
      
      const leftHand = new THREE.Mesh(handGeometry, handMaterial);
      leftHand.position.set(-1.8, 1.5, 0);
      leftHand.castShadow = true;
      studentGroup.add(leftHand);
      
      const rightHand = new THREE.Mesh(handGeometry, handMaterial);
      rightHand.position.set(1.8, 1.5, 0);
      rightHand.castShadow = true;
      studentGroup.add(rightHand);
      
      // Legs with school pants
      const legGeometry = new THREE.CylinderGeometry(0.45, 0.5, 3, 8);
      const legMaterial = new THREE.MeshLambertMaterial({ color: 0x000080 });
      
      const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
      leftLeg.position.set(-0.7, 0.5, 0);
      leftLeg.castShadow = true;
      studentGroup.add(leftLeg);
      
      const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
      rightLeg.position.set(0.7, 0.5, 0);
      rightLeg.castShadow = true;
      studentGroup.add(rightLeg);
      
      // Shoes
      const shoeGeometry = new THREE.BoxGeometry(0.8, 0.3, 1.2);
      const shoeMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
      
      const leftShoe = new THREE.Mesh(shoeGeometry, shoeMaterial);
      leftShoe.position.set(-0.7, -0.85, 0.2);
      leftShoe.castShadow = true;
      studentGroup.add(leftShoe);
      
      const rightShoe = new THREE.Mesh(shoeGeometry, shoeMaterial);
      rightShoe.position.set(0.7, -0.85, 0.2);
      rightShoe.castShadow = true;
      studentGroup.add(rightShoe);
      
      return studentGroup;
    };

    const playerMesh = createStudentCharacter();
    playerMesh.position.set(player.x, 0, player.y);
    scene.add(playerMesh);
    playerMeshRef.current = playerMesh;

    // Enhanced treasure boxes with level-based appearance
    treasureBoxes.forEach((box, index) => {
      const boxGroup = new THREE.Group();
      
      // Determine treasure box style based on difficulty
      const difficulty = box.question.difficulty;
      let boxColor = 0x696969;
      let glowColor = 0xFFD700;
      let boxSize = 3;
      
      if (difficulty === 'easy') {
        boxColor = box.isCompleted ? 0xFFD700 : box.isUnlocked ? 0x8B4513 : 0x696969;
        glowColor = 0x32CD32;
        boxSize = 2.5;
      } else if (difficulty === 'medium') {
        boxColor = box.isCompleted ? 0xFFD700 : box.isUnlocked ? 0x4169E1 : 0x696969;
        glowColor = 0x4169E1;
        boxSize = 3;
      } else {
        boxColor = box.isCompleted ? 0xFFD700 : box.isUnlocked ? 0x8B0000 : 0x696969;
        glowColor = 0xFF4500;
        boxSize = 3.5;
      }
      
      // Main treasure chest with enhanced geometry
      const boxGeometry = new THREE.BoxGeometry(boxSize, boxSize * 0.7, boxSize * 0.8);
      const boxMaterial = new THREE.MeshLambertMaterial({ color: boxColor });
      const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
      boxMesh.position.y = boxSize * 0.35;
      boxMesh.castShadow = true;
      boxMesh.receiveShadow = true;
      boxMesh.userData = { type: 'treasureBox', id: box.id };
      boxGroup.add(boxMesh);
      
      // Enhanced chest lid
      const lidGeometry = new THREE.BoxGeometry(boxSize * 1.1, boxSize * 0.15, boxSize * 0.9);
      const lidMaterial = new THREE.MeshLambertMaterial({ 
        color: box.isCompleted ? 0xFFD700 : box.isUnlocked ? boxColor : 0x555555 
      });
      const lid = new THREE.Mesh(lidGeometry, lidMaterial);
      lid.position.set(0, boxSize * 0.775, box.isCompleted ? -boxSize * 0.2 : 0);
      lid.rotation.x = box.isCompleted ? -Math.PI / 3 : 0;
      lid.castShadow = true;
      boxGroup.add(lid);
      
      // Decorative elements based on difficulty
      if (difficulty === 'medium' || difficulty === 'hard') {
        // Add gems/decorations
        for (let i = 0; i < 3; i++) {
          const gemGeometry = new THREE.OctahedronGeometry(0.2);
          const gemMaterial = new THREE.MeshLambertMaterial({ 
            color: difficulty === 'hard' ? 0xFF0000 : 0x0000FF,
            transparent: true,
            opacity: 0.8
          });
          const gem = new THREE.Mesh(gemGeometry, gemMaterial);
          gem.position.set(
            (i - 1) * 0.8,
            boxSize * 0.4,
            boxSize * 0.4
          );
          gem.castShadow = true;
          boxGroup.add(gem);
        }
      }
      
      // Lock system
      if (!box.isUnlocked) {
        const lockGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 8);
        const lockMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
        const lock = new THREE.Mesh(lockGeometry, lockMaterial);
        lock.position.set(0, boxSize * 0.5, boxSize * 0.45);
        lock.rotation.x = Math.PI / 2;
        lock.castShadow = true;
        boxGroup.add(lock);
      }
      
      boxGroup.position.set(box.x, 0, box.y);
      scene.add(boxGroup);

      // Enhanced glow effect for unlocked boxes
      if (box.isUnlocked && !box.isCompleted) {
        const glowGeometry = new THREE.SphereGeometry(boxSize * 1.5, 16, 12);
        const glowMaterial = new THREE.MeshBasicMaterial({ 
          color: glowColor, 
          transparent: true, 
          opacity: 0.15
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.set(box.x, boxSize * 0.7, box.y);
        scene.add(glow);
        
        // Particle effect
        const particleCount = 20;
        const particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount * 3; i += 3) {
          positions[i] = (Math.random() - 0.5) * 10;
          positions[i + 1] = Math.random() * 8;
          positions[i + 2] = (Math.random() - 0.5) * 10;
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particleMaterial = new THREE.PointsMaterial({
          color: glowColor,
          size: 0.3,
          transparent: true,
          opacity: 0.6
        });
        
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        particles.position.set(box.x, 0, box.y);
        scene.add(particles);
        
        // Animate effects
        const animateEffects = () => {
          const time = Date.now() * 0.001;
          glow.material.opacity = 0.1 + Math.sin(time * 2) * 0.1;
          glow.rotation.y += 0.01;
          
          // Animate particles
          const positions = particles.geometry.attributes.position.array;
          for (let i = 1; i < positions.length; i += 3) {
            positions[i] += Math.sin(time + i) * 0.02;
          }
          particles.geometry.attributes.position.needsUpdate = true;
          particles.rotation.y += 0.005;
        };
        
        const effectsAnimation = () => {
          animateEffects();
          requestAnimationFrame(effectsAnimation);
        };
        effectsAnimation();
      }

      // Enhanced hint system
      if (hintsEnabled && box.isUnlocked && !box.isCompleted && index === treasureBoxes.findIndex(b => b.isUnlocked && !b.isCompleted)) {
        // Floating arrow with trail effect
        const arrowGeometry = new THREE.ConeGeometry(0.8, 3, 8);
        const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
        const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
        arrow.position.set(box.x, 8, box.y);
        arrow.rotation.x = Math.PI;
        scene.add(arrow);
        
        // Trail effect
        const trailGeometry = new THREE.CylinderGeometry(0.1, 0.3, 2);
        const trailMaterial = new THREE.MeshBasicMaterial({ 
          color: 0x00FF00,
          transparent: true,
          opacity: 0.5
        });
        const trail = new THREE.Mesh(trailGeometry, trailMaterial);
        trail.position.set(box.x, 10, box.y);
        scene.add(trail);
        
        // Animate hint elements
        const animateHint = () => {
          const time = Date.now() * 0.003;
          arrow.position.y = 8 + Math.sin(time) * 2;
          arrow.rotation.z += 0.02;
          trail.position.y = 10 + Math.sin(time + 1) * 1.5;
          trail.material.opacity = 0.3 + Math.sin(time * 2) * 0.2;
        };
        
        const hintAnimation = () => {
          animateHint();
          requestAnimationFrame(hintAnimation);
        };
        hintAnimation();
      }
    });

    // Enhanced input handling
    const handleMouseMove = (event: MouseEvent) => {
      if (mouseRef.current.isLocked) {
        mouseRef.current.x += event.movementX * 0.002;
        mouseRef.current.y += event.movementY * 0.002;
        mouseRef.current.y = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, mouseRef.current.y));
      }
    };

    const handleClick = () => {
      if (renderer.domElement.requestPointerLock) {
        renderer.domElement.requestPointerLock();
      }
    };

    const handlePointerLockChange = () => {
      mouseRef.current.isLocked = document.pointerLockElement === renderer.domElement;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      keysRef.current[event.key.toLowerCase()] = true;
      if (event.key.toLowerCase() === ' ') {
        event.preventDefault();
        if (!isJumping) {
          setIsJumping(true);
          velocityRef.current.y = 0.5;
        }
      }
      // Interaction key
      if (event.key.toLowerCase() === 'e' && nearTreasure) {
        onTreasureBoxInteract(nearTreasure.id);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      keysRef.current[event.key.toLowerCase()] = false;
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick);
    document.addEventListener('pointerlockchange', handlePointerLockChange);

    // Enhanced game loop with better physics and interactions
    const animate = () => {
      requestAnimationFrame(animate);

      if (playerMeshRef.current && cameraRef.current) {
        const moveSpeed = 0.4;
        const currentPos = playerMeshRef.current.position;
        let newX = currentPos.x;
        let newZ = currentPos.z;
        let newY = currentPos.y;

        // Enhanced movement with momentum
        const forward = new THREE.Vector3(0, 0, -1);
        const right = new THREE.Vector3(1, 0, 0);
        
        forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), mouseRef.current.x);
        right.applyAxisAngle(new THREE.Vector3(0, 1, 0), mouseRef.current.x);

        let isMoving = false;
        if (keysRef.current['w']) {
          newX += forward.x * moveSpeed;
          newZ += forward.z * moveSpeed;
          isMoving = true;
        }
        if (keysRef.current['s']) {
          newX -= forward.x * moveSpeed;
          newZ -= forward.z * moveSpeed;
          isMoving = true;
        }
        if (keysRef.current['a']) {
          newX -= right.x * moveSpeed;
          newZ -= right.z * moveSpeed;
          isMoving = true;
        }
        if (keysRef.current['d']) {
          newX += right.x * moveSpeed;
          newZ += right.z * moveSpeed;
          isMoving = true;
        }

        // Enhanced boundary checking
        newX = Math.max(-220, Math.min(220, newX));
        newZ = Math.max(-220, Math.min(220, newZ));

        // Enhanced jump physics
        if (isJumping) {
          newY += velocityRef.current.y;
          velocityRef.current.y -= 0.025; // Gravity
          
          if (newY <= 0) {
            newY = 0;
            setIsJumping(false);
            velocityRef.current.y = 0;
          }
        }

        // Simple walking animation
        if (isMoving && !isJumping) {
          const walkCycle = Math.sin(Date.now() * 0.01) * 0.1;
          playerMeshRef.current.rotation.z = walkCycle;
        } else {
          playerMeshRef.current.rotation.z = 0;
        }

        // Update player position
        playerMeshRef.current.position.set(newX, newY, newZ);
        playerMeshRef.current.rotation.y = mouseRef.current.x;

        // Enhanced camera follow with smooth interpolation
        const cameraDistance = 15;
        const cameraHeight = 10;
        
        const targetCameraX = newX - Math.sin(mouseRef.current.x) * cameraDistance;
        const targetCameraZ = newZ - Math.cos(mouseRef.current.x) * cameraDistance;
        const targetCameraY = newY + cameraHeight + Math.sin(mouseRef.current.y) * 6;
        
        // Smooth camera interpolation
        camera.position.lerp(new THREE.Vector3(targetCameraX, targetCameraY, targetCameraZ), 0.1);
        camera.lookAt(newX, newY + 3, newZ);

        // Update game state if position changed
        if (newX !== currentPos.x || newZ !== currentPos.z) {
          onPlayerMove(newX, newZ);

          // Enhanced treasure box interaction detection
          let closestTreasure: TreasureBox | null = null;
          let closestDistance = Infinity;

          treasureBoxes.forEach(box => {
            const distance = Math.sqrt(
              Math.pow(newX - box.x, 2) + Math.pow(newZ - box.y, 2)
            );
            
            if (distance < 8 && box.isUnlocked && !box.isCompleted) {
              if (distance < closestDistance) {
                closestDistance = distance;
                closestTreasure = box;
              }
            }
          });

          setNearTreasure(closestTreasure);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      window.removeEventListener('resize', handleResize);
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update player position when prop changes
  useEffect(() => {
    if (playerMeshRef.current) {
      playerMeshRef.current.position.x = player.x;
      playerMeshRef.current.position.z = player.y;
    }
  }, [player.x, player.y]);

  return (
    <div ref={mountRef} className="w-full h-full cursor-none relative">
      {/* Enhanced interaction prompt */}
      {nearTreasure && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
          <div className="bg-black bg-opacity-80 text-white px-8 py-4 rounded-2xl text-center border-2 border-yellow-400 animate-pulse">
            <div className="text-2xl mb-2">🏆</div>
            <p className="text-xl font-bold mb-2">Treasure Found!</p>
            <p className="text-lg mb-1">{nearTreasure.question.difficulty.toUpperCase()} Level</p>
            <p className="text-sm text-yellow-300">Press E to open treasure chest</p>
          </div>
        </div>
      )}

      {/* Enhanced click to start instruction */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
        <div className="bg-black bg-opacity-70 text-white px-8 py-6 rounded-2xl text-center border border-white border-opacity-30">
          <div className="text-4xl mb-4">🎮</div>
          <p className="text-2xl font-bold mb-4">Welcome to Math Adventure!</p>
          <p className="text-lg mb-2">Click to start exploring the jungle!</p>
          <div className="text-sm mt-4 space-y-1 text-gray-300">
            <p><span className="font-semibold">WASD</span> - Move around</p>
            <p><span className="font-semibold">Mouse</span> - Look around</p>
            <p><span className="font-semibold">SPACE</span> - Jump</p>
            <p><span className="font-semibold">E</span> - Interact with treasures</p>
          </div>
        </div>
      </div>
    </div>
  );
};