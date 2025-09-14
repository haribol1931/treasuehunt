import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Player } from '../types/game';

interface GameCanvasProps {
  player: Player;
  onPlayerMove: (x: number, y: number) => void;
  onTreasureBoxInteract: (boxId: string) => void;
  treasureBoxes: any[];
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

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue
    scene.fog = new THREE.Fog(0x87CEEB, 50, 200);
    sceneRef.current = scene;

    // Camera setup - Third person
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 8, 12);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x87CEEB);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(50, 100, 25);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    scene.add(directionalLight);

    // Ground - Large jungle floor
    const groundGeometry = new THREE.PlaneGeometry(400, 400);
    const groundTexture = new THREE.TextureLoader().load('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJncmFzcyIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiPgogICAgICA8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzJFOEIzNyIvPgogICAgICA8Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIzIiBmaWxsPSIjMzJDRDMyIiBvcGFjaXR5PSIwLjciLz4KICAgICAgPGNpcmNsZSBjeD0iNzAiIGN5PSI0MCIgcj0iMiIgZmlsbD0iIzAwNjQwMCIgb3BhY2l0eT0iMC41Ii8+CiAgICAgIDxjaXJjbGUgY3g9IjUwIiBjeT0iODAiIHI9IjQiIGZpbGw9IiM5QUNEMzIiIG9wYWNpdHk9IjAuNiIvPgogICAgPC9wYXR0ZXJuPgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0idXJsKCNncmFzcykiLz4KPC9zdmc+');
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(20, 20);
    
    const groundMaterial = new THREE.MeshLambertMaterial({ 
      map: groundTexture,
      color: 0x2E8B37 
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Create extensive jungle environment
    const createTree = (x: number, z: number, scale: number = 1) => {
      const treeGroup = new THREE.Group();
      
      // Tree trunk with texture
      const trunkGeometry = new THREE.CylinderGeometry(0.8 * scale, 1.2 * scale, 12 * scale);
      const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.position.y = 6 * scale;
      trunk.castShadow = true;
      treeGroup.add(trunk);

      // Multiple layers of leaves for realistic look
      const leavesGeometry1 = new THREE.SphereGeometry(5 * scale);
      const leavesGeometry2 = new THREE.SphereGeometry(4 * scale);
      const leavesGeometry3 = new THREE.SphereGeometry(3 * scale);
      
      const leavesMaterial1 = new THREE.MeshLambertMaterial({ color: 0x006400 });
      const leavesMaterial2 = new THREE.MeshLambertMaterial({ color: 0x228B22 });
      const leavesMaterial3 = new THREE.MeshLambertMaterial({ color: 0x32CD32 });
      
      const leaves1 = new THREE.Mesh(leavesGeometry1, leavesMaterial1);
      leaves1.position.y = 14 * scale;
      leaves1.castShadow = true;
      treeGroup.add(leaves1);
      
      const leaves2 = new THREE.Mesh(leavesGeometry2, leavesMaterial2);
      leaves2.position.set(2 * scale, 16 * scale, 1 * scale);
      leaves2.castShadow = true;
      treeGroup.add(leaves2);
      
      const leaves3 = new THREE.Mesh(leavesGeometry3, leavesMaterial3);
      leaves3.position.set(-1.5 * scale, 18 * scale, -1 * scale);
      leaves3.castShadow = true;
      treeGroup.add(leaves3);

      treeGroup.position.set(x, 0, z);
      return treeGroup;
    };

    // Create dense jungle with varied tree sizes
    for (let i = 0; i < 150; i++) {
      const x = (Math.random() - 0.5) * 350;
      const z = (Math.random() - 0.5) * 350;
      const scale = 0.7 + Math.random() * 0.8;
      
      // Avoid placing trees too close to center (spawn area)
      if (Math.sqrt(x * x + z * z) > 15) {
        scene.add(createTree(x, z, scale));
      }
    }

    // Add rocks and jungle debris
    for (let i = 0; i < 50; i++) {
      const rockGeometry = new THREE.DodecahedronGeometry(1 + Math.random() * 2);
      const rockMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
      const rock = new THREE.Mesh(rockGeometry, rockMaterial);
      
      const x = (Math.random() - 0.5) * 300;
      const z = (Math.random() - 0.5) * 300;
      
      if (Math.sqrt(x * x + z * z) > 10) {
        rock.position.set(x, Math.random() * 2, z);
        rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        rock.castShadow = true;
        rock.receiveShadow = true;
        scene.add(rock);
      }
    }

    // Student character model
    const createStudentCharacter = () => {
      const studentGroup = new THREE.Group();
      
      // Body
      const bodyGeometry = new THREE.CylinderGeometry(1, 1.2, 3);
      const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x4169E1 }); // Royal blue shirt
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.position.y = 2.5;
      body.castShadow = true;
      studentGroup.add(body);
      
      // Head
      const headGeometry = new THREE.SphereGeometry(0.8);
      const headMaterial = new THREE.MeshLambertMaterial({ color: 0xFFDBAE }); // Skin tone
      const head = new THREE.Mesh(headGeometry, headMaterial);
      head.position.y = 4.8;
      head.castShadow = true;
      studentGroup.add(head);
      
      // Eyes
      const eyeGeometry = new THREE.SphereGeometry(0.1);
      const eyeMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
      
      const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
      leftEye.position.set(-0.3, 5, 0.7);
      studentGroup.add(leftEye);
      
      const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
      rightEye.position.set(0.3, 5, 0.7);
      studentGroup.add(rightEye);
      
      // Backpack
      const backpackGeometry = new THREE.BoxGeometry(1.5, 2, 0.8);
      const backpackMaterial = new THREE.MeshLambertMaterial({ color: 0x8B0000 }); // Dark red
      const backpack = new THREE.Mesh(backpackGeometry, backpackMaterial);
      backpack.position.set(0, 3, -1.2);
      backpack.castShadow = true;
      studentGroup.add(backpack);
      
      // Arms
      const armGeometry = new THREE.CylinderGeometry(0.3, 0.3, 2);
      const armMaterial = new THREE.MeshLambertMaterial({ color: 0xFFDBAE });
      
      const leftArm = new THREE.Mesh(armGeometry, armMaterial);
      leftArm.position.set(-1.5, 2.5, 0);
      leftArm.castShadow = true;
      studentGroup.add(leftArm);
      
      const rightArm = new THREE.Mesh(armGeometry, armMaterial);
      rightArm.position.set(1.5, 2.5, 0);
      rightArm.castShadow = true;
      studentGroup.add(rightArm);
      
      // Legs
      const legGeometry = new THREE.CylinderGeometry(0.4, 0.4, 2.5);
      const legMaterial = new THREE.MeshLambertMaterial({ color: 0x000080 }); // Navy pants
      
      const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
      leftLeg.position.set(-0.6, 0.25, 0);
      leftLeg.castShadow = true;
      studentGroup.add(leftLeg);
      
      const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
      rightLeg.position.set(0.6, 0.25, 0);
      rightLeg.castShadow = true;
      studentGroup.add(rightLeg);
      
      return studentGroup;
    };

    const playerMesh = createStudentCharacter();
    playerMesh.position.set(player.x, 0, player.y);
    scene.add(playerMesh);
    playerMeshRef.current = playerMesh;

    // Treasure boxes with enhanced visuals
    treasureBoxes.forEach((box, index) => {
      const boxGroup = new THREE.Group();
      
      // Main treasure chest
      const boxGeometry = new THREE.BoxGeometry(3, 2, 2.5);
      const boxMaterial = new THREE.MeshLambertMaterial({ 
        color: box.isCompleted ? 0xFFD700 : box.isUnlocked ? 0x8B4513 : 0x696969 
      });
      const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
      boxMesh.position.y = 1;
      boxMesh.castShadow = true;
      boxMesh.userData = { type: 'treasureBox', id: box.id };
      boxGroup.add(boxMesh);
      
      // Chest lid
      const lidGeometry = new THREE.BoxGeometry(3.2, 0.3, 2.7);
      const lidMaterial = new THREE.MeshLambertMaterial({ 
        color: box.isCompleted ? 0xFFD700 : box.isUnlocked ? 0x654321 : 0x555555 
      });
      const lid = new THREE.Mesh(lidGeometry, lidMaterial);
      lid.position.set(0, 2.15, box.isCompleted ? -0.5 : 0);
      lid.rotation.x = box.isCompleted ? -Math.PI / 4 : 0;
      lid.castShadow = true;
      boxGroup.add(lid);
      
      // Lock (if not unlocked)
      if (!box.isUnlocked) {
        const lockGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2);
        const lockMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
        const lock = new THREE.Mesh(lockGeometry, lockMaterial);
        lock.position.set(0, 1.5, 1.3);
        lock.rotation.x = Math.PI / 2;
        lock.castShadow = true;
        boxGroup.add(lock);
      }
      
      boxGroup.position.set(box.x, 0, box.y);
      scene.add(boxGroup);

      // Glow effect for unlocked boxes
      if (box.isUnlocked && !box.isCompleted) {
        const glowGeometry = new THREE.SphereGeometry(4);
        const glowMaterial = new THREE.MeshBasicMaterial({ 
          color: 0xFFD700, 
          transparent: true, 
          opacity: 0.2 
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.set(box.x, 2, box.y);
        scene.add(glow);
        
        // Animate glow
        const animateGlow = () => {
          glow.material.opacity = 0.1 + Math.sin(Date.now() * 0.003) * 0.1;
          glow.rotation.y += 0.01;
        };
        
        const glowAnimation = () => {
          animateGlow();
          requestAnimationFrame(glowAnimation);
        };
        glowAnimation();
      }

      // Hint arrow for next treasure (if hints enabled)
      if (hintsEnabled && box.isUnlocked && !box.isCompleted && index === treasureBoxes.findIndex(b => b.isUnlocked && !b.isCompleted)) {
        const arrowGeometry = new THREE.ConeGeometry(0.5, 2);
        const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
        const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
        arrow.position.set(box.x, 6, box.y);
        arrow.rotation.x = Math.PI;
        scene.add(arrow);
        
        // Animate hint arrow
        const animateArrow = () => {
          arrow.position.y = 6 + Math.sin(Date.now() * 0.005) * 1;
          arrow.rotation.z += 0.02;
        };
        
        const arrowAnimation = () => {
          animateArrow();
          requestAnimationFrame(arrowAnimation);
        };
        arrowAnimation();
      }
    });

    // Mouse controls for camera
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

    // Input handling
    const handleKeyDown = (event: KeyboardEvent) => {
      keysRef.current[event.key.toLowerCase()] = true;
      if (event.key.toLowerCase() === ' ') {
        event.preventDefault();
        if (!isJumping) {
          setIsJumping(true);
          velocityRef.current.y = 0.4;
        }
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

    // Game loop with physics
    const animate = () => {
      requestAnimationFrame(animate);

      if (playerMeshRef.current && cameraRef.current) {
        const moveSpeed = 0.3;
        const currentPos = playerMeshRef.current.position;
        let newX = currentPos.x;
        let newZ = currentPos.z;
        let newY = currentPos.y;

        // Movement with mouse look direction
        const forward = new THREE.Vector3(0, 0, -1);
        const right = new THREE.Vector3(1, 0, 0);
        
        forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), mouseRef.current.x);
        right.applyAxisAngle(new THREE.Vector3(0, 1, 0), mouseRef.current.x);

        if (keysRef.current['w']) {
          newX += forward.x * moveSpeed;
          newZ += forward.z * moveSpeed;
        }
        if (keysRef.current['s']) {
          newX -= forward.x * moveSpeed;
          newZ -= forward.z * moveSpeed;
        }
        if (keysRef.current['a']) {
          newX -= right.x * moveSpeed;
          newZ -= right.z * moveSpeed;
        }
        if (keysRef.current['d']) {
          newX += right.x * moveSpeed;
          newZ += right.z * moveSpeed;
        }

        // Boundary checking for large jungle
        newX = Math.max(-180, Math.min(180, newX));
        newZ = Math.max(-180, Math.min(180, newZ));

        // Jump physics
        if (isJumping) {
          newY += velocityRef.current.y;
          velocityRef.current.y -= 0.02; // Gravity
          
          if (newY <= 0) {
            newY = 0;
            setIsJumping(false);
            velocityRef.current.y = 0;
          }
        }

        // Update player position
        playerMeshRef.current.position.set(newX, newY, newZ);
        playerMeshRef.current.rotation.y = mouseRef.current.x;

        // Third-person camera follow
        const cameraDistance = 12;
        const cameraHeight = 8;
        
        const cameraX = newX - Math.sin(mouseRef.current.x) * cameraDistance;
        const cameraZ = newZ - Math.cos(mouseRef.current.x) * cameraDistance;
        const cameraY = newY + cameraHeight + Math.sin(mouseRef.current.y) * 5;
        
        camera.position.set(cameraX, cameraY, cameraZ);
        camera.lookAt(newX, newY + 2, newZ);

        // Update game state if position changed
        if (newX !== currentPos.x || newZ !== currentPos.z) {
          onPlayerMove(newX, newZ);

          // Check treasure box interactions
          treasureBoxes.forEach(box => {
            const distance = Math.sqrt(
              Math.pow(newX - box.x, 2) + Math.pow(newZ - box.y, 2)
            );
            if (distance < 5 && box.isUnlocked && !box.isCompleted) {
              onTreasureBoxInteract(box.id);
            }
          });
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
    <div ref={mountRef} className="w-full h-full cursor-none">
      {/* Click to start instruction */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
        <div className="bg-black bg-opacity-50 text-white px-6 py-3 rounded-lg text-center">
          <p className="text-lg font-semibold">Click to start exploring!</p>
          <p className="text-sm mt-1">Use WASD to move, mouse to look around, SPACE to jump</p>
        </div>
      </div>
    </div>
  );
};