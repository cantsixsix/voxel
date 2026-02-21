/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { VoxelData } from '../types';
import { COLORS, CONFIG } from './voxelConstants';

// Helper to prevent overlapping voxels
function setBlock(map: Map<string, VoxelData>, x: number, y: number, z: number, color: number) {
    const rx = Math.round(x);
    const ry = Math.round(y);
    const rz = Math.round(z);
    const key = `${rx},${ry},${rz}`;
    map.set(key, { x: rx, y: ry, z: rz, color });
}

function generateSphere(map: Map<string, VoxelData>, cx: number, cy: number, cz: number, r: number, col: number, sy = 1) {
    const r2 = r * r;
    const xMin = Math.floor(cx - r);
    const xMax = Math.ceil(cx + r);
    const yMin = Math.floor(cy - r * sy);
    const yMax = Math.ceil(cy + r * sy);
    const zMin = Math.floor(cz - r);
    const zMax = Math.ceil(cz + r);

    for (let x = xMin; x <= xMax; x++) {
        for (let y = yMin; y <= yMax; y++) {
            for (let z = zMin; z <= zMax; z++) {
                const dx = x - cx;
                const dy = (y - cy) / sy;
                const dz = z - cz;
                if (dx * dx + dy * dy + dz * dz <= r2) {
                    setBlock(map, x, y, z, col);
                }
            }
        }
    }
}

export const Generators = {
    Eagle: (): VoxelData[] => {
        const map = new Map<string, VoxelData>();
        // Branch
        for (let x = -8; x < 8; x++) {
            const y = Math.sin(x * 0.2) * 1.5;
            const z = Math.cos(x * 0.1) * 1.5;
            generateSphere(map, x, y, z, 1.8, COLORS.WOOD);
            if (Math.random() > 0.7) generateSphere(map, x, y + 2, z + (Math.random() - 0.5) * 3, 1.5, COLORS.GREEN);
        }
        // Body
        const EX = 0, EY = 2, EZ = 2;
        generateSphere(map, EX, EY + 6, EZ, 4.5, COLORS.DARK, 1.4);
        // Chest
        for (let x = EX - 2; x <= EX + 2; x++) for (let y = EY + 4; y <= EY + 9; y++) setBlock(map, x, y, EZ + 3, COLORS.LIGHT);
        // Wings (Rough approximation)
        for (let x of [-4, -3, 3, 4]) for (let y = EY + 4; y <= EY + 10; y++) for (let z = EZ - 2; z <= EZ + 3; z++) setBlock(map, x, y, z, COLORS.DARK);
        // Tail
        for (let x = EX - 2; x <= EX + 2; x++) for (let y = EY; y <= EY + 4; y++) for (let z = EZ - 5; z <= EZ - 3; z++) setBlock(map, x, y, z, COLORS.WHITE);
        // Head
        const HY = EY + 12, HZ = EZ + 1;
        generateSphere(map, EX, HY, HZ, 2.8, COLORS.WHITE);
        generateSphere(map, EX, HY - 2, HZ, 2.5, COLORS.WHITE);
        // Talons
        [[-2, 0], [-2, 1], [2, 0], [2, 1]].forEach(o => setBlock(map, EX + o[0], EY + o[1], EZ, COLORS.TALON));
        // Beak
        [[0, 1], [0, 2], [1, 1], [-1, 1]].forEach(o => setBlock(map, EX + o[0], HY, HZ + 2 + o[1], COLORS.GOLD));
        setBlock(map, EX, HY - 1, HZ + 3, COLORS.GOLD);
        // Eyes
        [[-1.5, COLORS.BLACK], [1.5, COLORS.BLACK]].forEach(o => setBlock(map, EX + o[0], HY + 0.5, HZ + 1.5, o[1]));
        [[-1.5, COLORS.WHITE], [1.5, COLORS.WHITE]].forEach(o => setBlock(map, EX + o[0], HY + 1.5, HZ + 1.5, o[1]));

        return Array.from(map.values());
    },

    Cat: (): VoxelData[] => {
        const map = new Map<string, VoxelData>();
        const CY = CONFIG.FLOOR_Y + 1; const CX = 0, CZ = 0;
        // Paws
        generateSphere(map, CX - 3, CY + 2, CZ, 2.2, COLORS.DARK, 1.2);
        generateSphere(map, CX + 3, CY + 2, CZ, 2.2, COLORS.DARK, 1.2);
        // Body
        for (let y = 0; y < 7; y++) {
            const r = 3.5 - (y * 0.2);
            generateSphere(map, CX, CY + 2 + y, CZ, r, COLORS.DARK);
            generateSphere(map, CX, CY + 2 + y, CZ + 2, r * 0.6, COLORS.WHITE);
        }
        // Legs
        for (let y = 0; y < 5; y++) {
            setBlock(map, CX - 1.5, CY + y, CZ + 3, COLORS.WHITE); setBlock(map, CX + 1.5, CY + y, CZ + 3, COLORS.WHITE);
            setBlock(map, CX - 1.5, CY + y, CZ + 2, COLORS.WHITE); setBlock(map, CX + 1.5, CY + y, CZ + 2, COLORS.WHITE);
        }
        // Head
        const CHY = CY + 9;
        generateSphere(map, CX, CHY, CZ, 3.2, COLORS.LIGHT, 0.8);
        // Ears
        [[-2, 1], [2, 1]].forEach(side => {
            setBlock(map, CX + side[0], CHY + 3, CZ, COLORS.DARK); setBlock(map, CX + side[0] * 0.8, CHY + 3, CZ + 1, COLORS.WHITE);
            setBlock(map, CX + side[0], CHY + 4, CZ, COLORS.DARK);
        });
        // Tail
        for (let i = 0; i < 12; i++) {
            const a = i * 0.3, tx = Math.cos(a) * 4.5, tz = Math.sin(a) * 4.5;
            if (tz > -2) { setBlock(map, CX + tx, CY, CZ + tz, COLORS.DARK); setBlock(map, CX + tx, CY + 1, CZ + tz, COLORS.DARK); }
        }
        // Face
        setBlock(map, CX - 1, CHY + 0.5, CZ + 2.5, COLORS.GOLD); setBlock(map, CX + 1, CHY + 0.5, CZ + 2.5, COLORS.GOLD);
        setBlock(map, CX - 1, CHY + 0.5, CZ + 3, COLORS.BLACK); setBlock(map, CX + 1, CHY + 0.5, CZ + 3, COLORS.BLACK);
        setBlock(map, CX, CHY, CZ + 3, COLORS.TALON);
        return Array.from(map.values());
    },

    Rabbit: (): VoxelData[] => {
        const map = new Map<string, VoxelData>();
        const LOG_Y = CONFIG.FLOOR_Y + 2.5;
        const RX = 0, RZ = 0;
        // Log
        for (let x = -6; x <= 6; x++) {
            const radius = 2.8 + Math.sin(x * 0.5) * 0.2;
            generateSphere(map, x, LOG_Y, 0, radius, COLORS.DARK);
            if (x === -6 || x === 6) generateSphere(map, x, LOG_Y, 0, radius - 0.5, COLORS.WOOD);
            if (Math.random() > 0.8) setBlock(map, x, LOG_Y + radius, (Math.random() - 0.5) * 2, COLORS.GREEN);
        }
        // Body
        const BY = LOG_Y + 2.5;
        generateSphere(map, RX - 1.5, BY + 1.5, RZ - 1.5, 1.8, COLORS.WHITE);
        generateSphere(map, RX + 1.5, BY + 1.5, RZ - 1.5, 1.8, COLORS.WHITE);
        generateSphere(map, RX, BY + 2, RZ, 2.2, COLORS.WHITE, 0.8);
        generateSphere(map, RX, BY + 2.5, RZ + 1.5, 1.5, COLORS.WHITE);
        setBlock(map, RX - 1.2, BY, RZ + 2.2, COLORS.LIGHT); setBlock(map, RX + 1.2, BY, RZ + 2.2, COLORS.LIGHT);
        setBlock(map, RX - 2.2, BY, RZ - 0.5, COLORS.WHITE); setBlock(map, RX + 2.2, BY, RZ - 0.5, COLORS.WHITE);
        generateSphere(map, RX, BY + 1.5, RZ - 2.5, 1.0, COLORS.WHITE);
        // Head
        const HY = BY + 4.5; const HZ = RZ + 1;
        generateSphere(map, RX, HY, HZ, 1.7, COLORS.WHITE);
        generateSphere(map, RX - 1.1, HY - 0.5, HZ + 0.5, 1.0, COLORS.WHITE);
        generateSphere(map, RX + 1.1, HY - 0.5, HZ + 0.5, 1.0, COLORS.WHITE);
        // Ears
        for (let y = 0; y < 5; y++) {
            const curve = y * 0.2;
            setBlock(map, RX - 0.8, HY + 1.5 + y, HZ - curve, COLORS.WHITE); setBlock(map, RX - 1.2, HY + 1.5 + y, HZ - curve, COLORS.WHITE);
            setBlock(map, RX - 1.0, HY + 1.5 + y, HZ - curve + 0.5, COLORS.LIGHT);
            setBlock(map, RX + 0.8, HY + 1.5 + y, HZ - curve, COLORS.WHITE); setBlock(map, RX + 1.2, HY + 1.5 + y, HZ - curve, COLORS.WHITE);
            setBlock(map, RX + 1.0, HY + 1.5 + y, HZ - curve + 0.5, COLORS.LIGHT);
        }
        setBlock(map, RX - 0.8, HY + 0.2, HZ + 1.5, COLORS.BLACK); setBlock(map, RX + 0.8, HY + 0.2, HZ + 1.5, COLORS.BLACK);
        setBlock(map, RX, HY - 0.5, HZ + 1.8, COLORS.TALON);
        return Array.from(map.values());
    },

    Twins: (): VoxelData[] => {
        const map = new Map<string, VoxelData>();
        function buildMiniEagle(offsetX: number, offsetZ: number, mirror: boolean) {
            // Branch
            for (let x = -5; x < 5; x++) {
                const y = Math.sin(x * 0.4) * 0.5;
                generateSphere(map, offsetX + x, y, offsetZ, 1.2, COLORS.WOOD);
                if (Math.random() > 0.8) generateSphere(map, offsetX + x, y + 1, offsetZ, 1, COLORS.GREEN);
            }
            const EX = offsetX, EY = 1.5, EZ = offsetZ;
            generateSphere(map, EX, EY + 4, EZ, 3.0, COLORS.DARK, 1.4);
            for (let x = EX - 1; x <= EX + 1; x++) for (let y = EY + 2; y <= EY + 6; y++) setBlock(map, x, y, EZ + 2, COLORS.LIGHT);
            for (let x = EX - 1; x <= EX + 1; x++) for (let y = EY + 2; y <= EY + 3; y++) setBlock(map, x, y, EZ - 3, COLORS.WHITE);
            for (let y = EY + 2; y <= EY + 6; y++) for (let z = EZ - 1; z <= EZ + 2; z++) { setBlock(map, EX - 3, y, z, COLORS.DARK); setBlock(map, EX + 3, y, z, COLORS.DARK); }
            const HY = EY + 8, HZ = EZ + 1;
            generateSphere(map, EX, HY, HZ, 2.0, COLORS.WHITE);
            setBlock(map, EX, HY, HZ + 2, COLORS.GOLD); setBlock(map, EX, HY - 0.5, HZ + 2, COLORS.GOLD);
            setBlock(map, EX - 1, HY + 0.5, HZ + 1, COLORS.BLACK); setBlock(map, EX + 1, HY + 0.5, HZ + 1, COLORS.BLACK);
            setBlock(map, EX - 1, EY, EZ, COLORS.TALON); setBlock(map, EX + 1, EY, EZ, COLORS.TALON);
        }
        buildMiniEagle(-10, 2, false);
        buildMiniEagle(10, -2, true);
        return Array.from(map.values());
    },

    Dog: (): VoxelData[] => {
        const map = new Map<string, VoxelData>();
        const CY = CONFIG.FLOOR_Y + 1; const CX = 0, CZ = 0;
        // Paws
        generateSphere(map, CX - 2.5, CY + 2, CZ - 1, 2.0, COLORS.WOOD, 1.2);
        generateSphere(map, CX + 2.5, CY + 2, CZ - 1, 2.0, COLORS.WOOD, 1.2);
        // Body
        for (let y = 0; y < 8; y++) {
            const r = 3.8 - (y * 0.15);
            generateSphere(map, CX, CY + 2 + y, CZ, r, COLORS.WOOD);
            generateSphere(map, CX, CY + 2 + y, CZ + 2.5, r * 0.5, COLORS.LIGHT);
        }
        // Legs
        for (let y = 0; y < 6; y++) {
            setBlock(map, CX - 1.5, CY + y, CZ + 3.5, COLORS.LIGHT); setBlock(map, CX + 1.5, CY + y, CZ + 3.5, COLORS.LIGHT);
            setBlock(map, CX - 1.5, CY + y, CZ + 2.5, COLORS.LIGHT); setBlock(map, CX + 1.5, CY + y, CZ + 2.5, COLORS.LIGHT);
        }
        // Head
        const CHY = CY + 10;
        generateSphere(map, CX, CHY, CZ + 1, 3.5, COLORS.WOOD, 0.9);
        // Snout
        generateSphere(map, CX, CHY - 1, CZ + 3.5, 2.0, COLORS.LIGHT, 0.8);
        setBlock(map, CX, CHY - 0.5, CZ + 5.5, COLORS.BLACK);
        // Ears (Floppy)
        for (let y = 0; y < 4; y++) {
            setBlock(map, CX - 3.5, CHY + 1 - y, CZ, COLORS.DARK); setBlock(map, CX - 3.5, CHY + 1 - y, CZ + 1, COLORS.WOOD);
            setBlock(map, CX + 3.5, CHY + 1 - y, CZ, COLORS.DARK); setBlock(map, CX + 3.5, CHY + 1 - y, CZ + 1, COLORS.WOOD);
        }
        // Tail
        for (let i = 0; i < 8; i++) {
            const tx = Math.sin(i * 0.5) * 1.5;
            setBlock(map, CX + tx, CY + 3 + i * 0.8, CZ - 4 - i * 0.5, COLORS.WOOD);
        }
        // Eyes
        setBlock(map, CX - 1.5, CHY + 1, CZ + 4, COLORS.BLACK); setBlock(map, CX + 1.5, CHY + 1, CZ + 4, COLORS.BLACK);
        return Array.from(map.values());
    },

    Turtle: (): VoxelData[] => {
        const map = new Map<string, VoxelData>();
        const CY = CONFIG.FLOOR_Y + 1; const CX = 0, CZ = 0;
        // Shell
        generateSphere(map, CX, CY + 3, CZ, 6, COLORS.GREEN, 0.6);
        generateSphere(map, CX, CY + 4, CZ, 5, COLORS.DARK, 0.5);
        // Legs
        generateSphere(map, CX - 4, CY + 1, CZ + 3, 2, COLORS.WOOD);
        generateSphere(map, CX + 4, CY + 1, CZ + 3, 2, COLORS.WOOD);
        generateSphere(map, CX - 4, CY + 1, CZ - 3, 2, COLORS.WOOD);
        generateSphere(map, CX + 4, CY + 1, CZ - 3, 2, COLORS.WOOD);
        // Head
        generateSphere(map, CX, CY + 2, CZ + 6, 2.5, COLORS.WOOD);
        // Eyes
        setBlock(map, CX - 1, CY + 3, CZ + 8, COLORS.BLACK);
        setBlock(map, CX + 1, CY + 3, CZ + 8, COLORS.BLACK);
        // Tail
        generateSphere(map, CX, CY + 1.5, CZ - 5, 1.5, COLORS.WOOD);
        return Array.from(map.values());
    },

    Squirrel: (): VoxelData[] => {
        const map = new Map<string, VoxelData>();
        const CY = CONFIG.FLOOR_Y + 1; const CX = 0, CZ = 0;
        // Paws
        generateSphere(map, CX - 1.5, CY + 1, CZ, 1.5, COLORS.WOOD, 1.2);
        generateSphere(map, CX + 1.5, CY + 1, CZ, 1.5, COLORS.WOOD, 1.2);
        // Body
        for (let y = 0; y < 6; y++) {
            const r = 2.8 - (y * 0.15);
            generateSphere(map, CX, CY + 1 + y, CZ, r, COLORS.WOOD);
            generateSphere(map, CX, CY + 1 + y, CZ + 1.5, r * 0.6, COLORS.WHITE);
        }
        // Head
        const CHY = CY + 7;
        generateSphere(map, CX, CHY, CZ + 0.5, 2.5, COLORS.WOOD, 0.9);
        // Snout
        generateSphere(map, CX, CHY - 0.5, CZ + 2.5, 1.2, COLORS.WHITE, 0.8);
        setBlock(map, CX, CHY, CZ + 3.5, COLORS.BLACK);
        // Ears
        [[-1.5, 1], [1.5, 1]].forEach(side => {
            setBlock(map, CX + side[0], CHY + 2, CZ, COLORS.WOOD); 
            setBlock(map, CX + side[0], CHY + 3, CZ, COLORS.WOOD);
        });
        // Tail (Bushy and curved up)
        for (let i = 0; i < 12; i++) {
            const ty = CY + 1 + i * 0.8;
            const tz = CZ - 2 - Math.sin(i * 0.3) * 3;
            generateSphere(map, CX, ty, tz, 2.5 - Math.abs(i - 6) * 0.15, COLORS.WOOD);
        }
        // Face
        setBlock(map, CX - 1, CHY + 0.5, CZ + 2.5, COLORS.BLACK); setBlock(map, CX + 1, CHY + 0.5, CZ + 2.5, COLORS.BLACK);
        return Array.from(map.values());
    },

    Fish: (): VoxelData[] => {
        const map = new Map<string, VoxelData>();
        const CX = 0, CY = CONFIG.FLOOR_Y + 6, CZ = 0;
        // Body (elongated oval)
        generateSphere(map, CX, CY, CZ, 5, COLORS.BLUE, 0.7);
        // Belly
        for (let x = CX - 3; x <= CX + 3; x++) {
            for (let z = CZ - 1; z <= CZ + 1; z++) {
                setBlock(map, x, CY - 2, z, COLORS.WHITE);
                setBlock(map, x, CY - 3, z, COLORS.WHITE);
            }
        }
        // Dorsal fin
        for (let x = CX - 2; x <= CX + 1; x++) {
            setBlock(map, x, CY + 3, CZ, COLORS.GOLD);
            setBlock(map, x, CY + 4, CZ, COLORS.GOLD);
            if (x > CX - 2) setBlock(map, x, CY + 5, CZ, COLORS.GOLD);
        }
        // Tail fin
        for (let y = -3; y <= 3; y++) {
            setBlock(map, CX - 6, CY + y, CZ, COLORS.GOLD);
            setBlock(map, CX - 7, CY + y * 1.3, CZ, COLORS.GOLD);
            if (Math.abs(y) > 1) setBlock(map, CX - 8, CY + y * 1.5, CZ, COLORS.GOLD);
        }
        // Pectoral fins
        for (let i = 0; i < 3; i++) {
            setBlock(map, CX + 1 - i, CY - 2, CZ + 3 + i, COLORS.BLUE);
            setBlock(map, CX + 1 - i, CY - 2, CZ - 3 - i, COLORS.BLUE);
        }
        // Eye
        setBlock(map, CX + 3, CY + 1, CZ + 2, COLORS.BLACK);
        setBlock(map, CX + 3, CY + 1, CZ - 2, COLORS.BLACK);
        setBlock(map, CX + 3, CY + 1.5, CZ + 2, COLORS.WHITE);
        setBlock(map, CX + 3, CY + 1.5, CZ - 2, COLORS.WHITE);
        // Mouth
        setBlock(map, CX + 5, CY, CZ, COLORS.RED);
        // Scales detail
        for (let x = CX - 3; x <= CX + 3; x += 2) {
            for (let z = CZ - 2; z <= CZ + 2; z += 2) {
                setBlock(map, x, CY + 1, z, 0x3377DD);
            }
        }
        return Array.from(map.values());
    },

    Elephant: (): VoxelData[] => {
        const map = new Map<string, VoxelData>();
        const CY = CONFIG.FLOOR_Y + 1; const CX = 0, CZ = 0;
        // Body (large barrel)
        generateSphere(map, CX, CY + 7, CZ, 6, COLORS.GRAY, 0.9);
        // Belly lighter
        for (let x = CX - 3; x <= CX + 3; x++) {
            for (let z = CZ - 3; z <= CZ + 3; z++) {
                setBlock(map, x, CY + 3, z, COLORS.DARK_GRAY);
            }
        }
        // Four legs (thick)
        for (let y = 0; y < 6; y++) {
            generateSphere(map, CX - 4, CY + y, CZ + 3, 2, COLORS.GRAY);
            generateSphere(map, CX + 4, CY + y, CZ + 3, 2, COLORS.GRAY);
            generateSphere(map, CX - 4, CY + y, CZ - 3, 2, COLORS.GRAY);
            generateSphere(map, CX + 4, CY + y, CZ - 3, 2, COLORS.GRAY);
        }
        // Feet / toenails
        [[-4, 3], [-4, -3], [4, 3], [4, -3]].forEach(([ox, oz]) => {
            setBlock(map, CX + ox - 1, CY, CZ + oz, COLORS.IVORY);
            setBlock(map, CX + ox + 1, CY, CZ + oz, COLORS.IVORY);
            setBlock(map, CX + ox, CY, CZ + oz + 1, COLORS.IVORY);
        });
        // Head
        const HY = CY + 12;
        generateSphere(map, CX, HY, CZ + 4, 4, COLORS.GRAY, 0.9);
        // Eyes
        setBlock(map, CX - 2.5, HY + 1, CZ + 7, COLORS.BLACK);
        setBlock(map, CX + 2.5, HY + 1, CZ + 7, COLORS.BLACK);
        // Ears (large flaps)
        for (let y = -2; y <= 3; y++) {
            for (let z = 0; z <= 3; z++) {
                setBlock(map, CX - 5, HY + y, CZ + 2 + z, COLORS.DARK_GRAY);
                setBlock(map, CX + 5, HY + y, CZ + 2 + z, COLORS.DARK_GRAY);
                if (Math.abs(y) < 2) {
                    setBlock(map, CX - 6, HY + y, CZ + 3 + z * 0.5, COLORS.GRAY);
                    setBlock(map, CX + 6, HY + y, CZ + 3 + z * 0.5, COLORS.GRAY);
                }
            }
        }
        // Trunk (curved downward)
        for (let i = 0; i < 10; i++) {
            const ty = HY - 1 - i * 0.8;
            const tz = CZ + 7 + i * 0.5;
            generateSphere(map, CX, ty, tz, 1.5 - i * 0.08, COLORS.GRAY);
        }
        // Tusks
        for (let i = 0; i < 5; i++) {
            setBlock(map, CX - 1.5, HY - 2 - i, CZ + 6 + i * 0.3, COLORS.IVORY);
            setBlock(map, CX + 1.5, HY - 2 - i, CZ + 6 + i * 0.3, COLORS.IVORY);
        }
        // Tail
        for (let i = 0; i < 5; i++) {
            setBlock(map, CX, CY + 10 - i, CZ - 6 - i * 0.5, COLORS.DARK_GRAY);
        }
        setBlock(map, CX - 0.5, CY + 5, CZ - 9, COLORS.DARK_GRAY);
        setBlock(map, CX + 0.5, CY + 5, CZ - 9, COLORS.DARK_GRAY);
        return Array.from(map.values());
    },

    Lion: (): VoxelData[] => {
        const map = new Map<string, VoxelData>();
        const CY = CONFIG.FLOOR_Y + 1; const CX = 0, CZ = 0;
        // Body
        for (let y = 0; y < 7; y++) {
            const r = 3.5 - (y * 0.15);
            generateSphere(map, CX, CY + 3 + y, CZ, r, COLORS.GOLD);
        }
        // Belly
        for (let x = CX - 2; x <= CX + 2; x++) {
            for (let y = CY + 3; y <= CY + 6; y++) {
                setBlock(map, x, y, CZ + 3, COLORS.WHITE);
            }
        }
        // Four legs
        for (let y = 0; y < 5; y++) {
            generateSphere(map, CX - 2.5, CY + y, CZ + 2, 1.5, COLORS.GOLD);
            generateSphere(map, CX + 2.5, CY + y, CZ + 2, 1.5, COLORS.GOLD);
            generateSphere(map, CX - 2.5, CY + y, CZ - 2, 1.5, COLORS.GOLD);
            generateSphere(map, CX + 2.5, CY + y, CZ - 2, 1.5, COLORS.GOLD);
        }
        // Head
        const HY = CY + 10;
        generateSphere(map, CX, HY, CZ + 1, 3, COLORS.GOLD, 0.9);
        // Mane (ring around head)
        for (let a = 0; a < Math.PI * 2; a += 0.4) {
            const mx = Math.cos(a) * 4;
            const my = Math.sin(a) * 3.5;
            generateSphere(map, CX + mx, HY + my * 0.8, CZ, 1.5, COLORS.ORANGE);
            generateSphere(map, CX + mx * 0.8, HY + my * 0.7, CZ - 0.5, 1.2, COLORS.ORANGE);
        }
        // Snout
        generateSphere(map, CX, HY - 1, CZ + 3.5, 1.8, COLORS.WHITE, 0.7);
        setBlock(map, CX, HY - 0.5, CZ + 5, COLORS.BLACK); // nose
        // Mouth
        setBlock(map, CX - 1, HY - 2, CZ + 4, COLORS.RED);
        setBlock(map, CX + 1, HY - 2, CZ + 4, COLORS.RED);
        // Eyes
        setBlock(map, CX - 1.5, HY + 1, CZ + 3, COLORS.BLACK);
        setBlock(map, CX + 1.5, HY + 1, CZ + 3, COLORS.BLACK);
        setBlock(map, CX - 1.5, HY + 1.5, CZ + 3, COLORS.GOLD);
        setBlock(map, CX + 1.5, HY + 1.5, CZ + 3, COLORS.GOLD);
        // Ears
        setBlock(map, CX - 2, HY + 3, CZ + 1, COLORS.GOLD);
        setBlock(map, CX + 2, HY + 3, CZ + 1, COLORS.GOLD);
        // Tail with tuft
        for (let i = 0; i < 10; i++) {
            const tz = CZ - 4 - i * 0.8;
            const ty = CY + 6 + Math.sin(i * 0.4) * 2;
            setBlock(map, CX, ty, tz, COLORS.GOLD);
        }
        // Tail tuft
        generateSphere(map, CX, CY + 6, CZ - 12, 1.5, COLORS.ORANGE);
        return Array.from(map.values());
    },

    Snake: (): VoxelData[] => {
        const map = new Map<string, VoxelData>();
        const CY = CONFIG.FLOOR_Y + 1; const CX = 0, CZ = 0;
        // Coiled body
        const coils = 3;
        const totalSegments = 60;
        for (let i = 0; i < totalSegments; i++) {
            const t = i / totalSegments;
            const angle = t * Math.PI * 2 * coils;
            const radius = 6 - t * 3;
            const px = CX + Math.cos(angle) * radius;
            const pz = CZ + Math.sin(angle) * radius;
            const py = CY + t * 12;
            const bodyRadius = 1.5 - t * 0.3;
            const color = i % 6 < 3 ? COLORS.GREEN : COLORS.DARK;
            generateSphere(map, px, py, pz, bodyRadius, color);
        }
        // Head (at the top of the coil)
        const headY = CY + 12.5;
        generateSphere(map, CX - 1, headY, CZ - 1, 2.5, COLORS.GREEN, 0.8);
        // Eyes
        setBlock(map, CX - 2.5, headY + 1, CZ + 0.5, COLORS.GOLD);
        setBlock(map, CX + 0.5, headY + 1, CZ + 0.5, COLORS.GOLD);
        setBlock(map, CX - 2.5, headY + 1.5, CZ + 0.5, COLORS.BLACK);
        setBlock(map, CX + 0.5, headY + 1.5, CZ + 0.5, COLORS.BLACK);
        // Forked tongue
        setBlock(map, CX - 1, headY - 0.5, CZ + 2, COLORS.RED);
        setBlock(map, CX - 1, headY - 0.5, CZ + 3, COLORS.RED);
        setBlock(map, CX - 1.5, headY - 0.5, CZ + 4, COLORS.RED);
        setBlock(map, CX - 0.5, headY - 0.5, CZ + 4, COLORS.RED);
        // Diamond pattern on body detail
        for (let i = 0; i < totalSegments; i += 4) {
            const t = i / totalSegments;
            const angle = t * Math.PI * 2 * coils;
            const radius = 6 - t * 3;
            const px = CX + Math.cos(angle) * radius;
            const pz = CZ + Math.sin(angle) * radius;
            const py = CY + t * 12;
            setBlock(map, px, py + 1.5, pz, COLORS.GOLD);
        }
        return Array.from(map.values());
    },

    Bear: (): VoxelData[] => {
        const map = new Map<string, VoxelData>();
        const CY = CONFIG.FLOOR_Y + 1; const CX = 0, CZ = 0;
        // Body (bulky)
        generateSphere(map, CX, CY + 6, CZ, 5, COLORS.DARK, 1.1);
        // Belly
        for (let x = CX - 3; x <= CX + 3; x++) {
            for (let y = CY + 3; y <= CY + 7; y++) {
                setBlock(map, x, y, CZ + 4, COLORS.LIGHT);
            }
        }
        // Paws/Legs (sitting position)
        generateSphere(map, CX - 3, CY + 2, CZ + 1, 2.5, COLORS.DARK, 1.1);
        generateSphere(map, CX + 3, CY + 2, CZ + 1, 2.5, COLORS.DARK, 1.1);
        // Front paws extended
        generateSphere(map, CX - 2, CY + 4, CZ + 4, 1.8, COLORS.DARK);
        generateSphere(map, CX + 2, CY + 4, CZ + 4, 1.8, COLORS.DARK);
        // Paw pads
        setBlock(map, CX - 2, CY + 3, CZ + 5.5, COLORS.LIGHT);
        setBlock(map, CX + 2, CY + 3, CZ + 5.5, COLORS.LIGHT);
        // Back legs
        for (let y = 0; y < 4; y++) {
            setBlock(map, CX - 2, CY + y, CZ + 3, COLORS.DARK);
            setBlock(map, CX + 2, CY + y, CZ + 3, COLORS.DARK);
            setBlock(map, CX - 2, CY + y, CZ + 2, COLORS.DARK);
            setBlock(map, CX + 2, CY + y, CZ + 2, COLORS.DARK);
        }
        // Head
        const HY = CY + 11;
        generateSphere(map, CX, HY, CZ + 1, 3.5, COLORS.DARK, 0.9);
        // Snout
        generateSphere(map, CX, HY - 1, CZ + 4, 2.0, COLORS.LIGHT, 0.7);
        setBlock(map, CX, HY - 0.5, CZ + 5.5, COLORS.BLACK); // nose
        // Mouth
        setBlock(map, CX - 0.5, HY - 2, CZ + 4.5, COLORS.BLACK);
        setBlock(map, CX + 0.5, HY - 2, CZ + 4.5, COLORS.BLACK);
        // Eyes
        setBlock(map, CX - 1.5, HY + 0.5, CZ + 3.5, COLORS.BLACK);
        setBlock(map, CX + 1.5, HY + 0.5, CZ + 3.5, COLORS.BLACK);
        // Ears (small round)
        generateSphere(map, CX - 2.5, HY + 3, CZ, 1.2, COLORS.DARK);
        generateSphere(map, CX + 2.5, HY + 3, CZ, 1.2, COLORS.DARK);
        generateSphere(map, CX - 2.5, HY + 3, CZ + 0.5, 0.8, COLORS.LIGHT);
        generateSphere(map, CX + 2.5, HY + 3, CZ + 0.5, 0.8, COLORS.LIGHT);
        // Short tail
        generateSphere(map, CX, CY + 8, CZ - 5, 1.5, COLORS.DARK);
        return Array.from(map.values());
    },

    Dinosaur: (): VoxelData[] => {
        const map = new Map<string, VoxelData>();
        const CY = CONFIG.FLOOR_Y + 1; const CX = 0, CZ = 0;
        // Body (large torso, leaning forward)
        generateSphere(map, CX, CY + 8, CZ, 5, COLORS.GREEN, 1.2);
        // Belly
        for (let x = CX - 3; x <= CX + 3; x++) {
            for (let y = CY + 5; y <= CY + 9; y++) {
                setBlock(map, x, y, CZ + 4, COLORS.WHITE);
            }
        }
        // Two powerful legs
        for (let y = 0; y < 7; y++) {
            generateSphere(map, CX - 3, CY + y, CZ, 2, COLORS.GREEN);
            generateSphere(map, CX + 3, CY + y, CZ, 2, COLORS.GREEN);
        }
        // Feet with claws
        generateSphere(map, CX - 3, CY, CZ + 1.5, 2.5, COLORS.GREEN, 0.5);
        generateSphere(map, CX + 3, CY, CZ + 1.5, 2.5, COLORS.GREEN, 0.5);
        setBlock(map, CX - 3, CY, CZ + 4, COLORS.IVORY);
        setBlock(map, CX + 3, CY, CZ + 4, COLORS.IVORY);
        setBlock(map, CX - 4, CY, CZ + 3.5, COLORS.IVORY);
        setBlock(map, CX + 4, CY, CZ + 3.5, COLORS.IVORY);
        // Small arms
        for (let i = 0; i < 3; i++) {
            setBlock(map, CX - 4, CY + 9 - i, CZ + 3 + i, COLORS.GREEN);
            setBlock(map, CX + 4, CY + 9 - i, CZ + 3 + i, COLORS.GREEN);
        }
        setBlock(map, CX - 4, CY + 6, CZ + 6, COLORS.IVORY);
        setBlock(map, CX + 4, CY + 6, CZ + 6, COLORS.IVORY);
        // Neck
        for (let y = 0; y < 5; y++) {
            generateSphere(map, CX, CY + 11 + y, CZ + 2 + y * 0.5, 2.5 - y * 0.2, COLORS.GREEN);
        }
        // Head (large with jaw)
        const HY = CY + 16; const HZ = CZ + 5;
        generateSphere(map, CX, HY, HZ, 3.5, COLORS.GREEN, 0.8);
        // Jaw
        generateSphere(map, CX, HY - 1.5, HZ + 2, 2.5, COLORS.GREEN, 0.5);
        // Teeth
        for (let x = -1; x <= 1; x++) {
            setBlock(map, CX + x, HY - 2, HZ + 3.5, COLORS.IVORY);
            setBlock(map, CX + x, HY - 0.5, HZ + 4, COLORS.IVORY);
        }
        // Eyes
        setBlock(map, CX - 2, HY + 1, HZ + 2.5, COLORS.RED);
        setBlock(map, CX + 2, HY + 1, HZ + 2.5, COLORS.RED);
        setBlock(map, CX - 2, HY + 1.5, HZ + 2.5, COLORS.BLACK);
        setBlock(map, CX + 2, HY + 1.5, HZ + 2.5, COLORS.BLACK);
        // Nostrils
        setBlock(map, CX - 1, HY, HZ + 4, COLORS.DARK);
        setBlock(map, CX + 1, HY, HZ + 4, COLORS.DARK);
        // Spines along back
        for (let i = 0; i < 12; i++) {
            const sz = CZ - 2 + i * 0.8;
            const sy = CY + 10 + Math.sin(i * 0.3) * 2;
            setBlock(map, CX, sy + 3, sz, COLORS.ORANGE);
            setBlock(map, CX, sy + 4, sz, COLORS.ORANGE);
        }
        // Tail (long and thick)
        for (let i = 0; i < 15; i++) {
            const tz = CZ - 5 - i * 1.2;
            const ty = CY + 7 - i * 0.3;
            const tr = 2.5 - i * 0.12;
            generateSphere(map, CX, ty, tz, tr > 0.5 ? tr : 0.5, COLORS.GREEN);
        }
        // Tail tip
        setBlock(map, CX, CY + 2, CZ - 22, COLORS.DARK);
        return Array.from(map.values());
    }
};
