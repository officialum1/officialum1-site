import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const inventoryFile = path.join(process.cwd(), 'data', 'inventory.json');
const balanceFile = path.join(process.cwd(), 'data', 'balance_history.json');

function getData(file: string) {
    if (!fs.existsSync(file)) return [];
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function saveData(file: string, data: any[]) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'inventory' or 'balance'
    const role = searchParams.get('role'); // 'admin' or 'staff'

    if (type === 'balance') {
        const balance = getData(balanceFile);
        if (role === 'staff') {
            // Staff might only need to see their own sales, but for now let's return empty or just their sales if needed. 
            // Requirement says "admin can see how much balance...". Staff probably just needs to see nothing or their own. 
            // Let's hide balance history for staff for now unless requested.
            return NextResponse.json([]);
        }
        return NextResponse.json(balance);
    }

    const inventory = getData(inventoryFile);

    if (role === 'staff') {
        const email = searchParams.get('email');
        if (!email) return NextResponse.json([]); // Security: must valid email

        // Load employees to check permissions
        const employeesFile = path.join(process.cwd(), 'data', 'employees.json');
        let allowedPlatforms: string[] = [];
        if (fs.existsSync(employeesFile)) {
            const employees = JSON.parse(fs.readFileSync(employeesFile, 'utf8'));
            const staff = employees.find((e: any) => e.email.toLowerCase() === email.toLowerCase());
            if (staff && staff.allowedPlatforms) {
                allowedPlatforms = staff.allowedPlatforms;
            }
        }

        // Filter Inventory based on permissions
        const staffInventory = inventory
            .filter((item: any) => allowedPlatforms.includes(item.platform))
            .map((item: any) => ({
                id: item.id,
                name: item.name,
                platform: item.platform,
                status: item.status,
                // purchasePrice removed
            }));
        return NextResponse.json(staffInventory);
    }

    return NextResponse.json(inventory);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const action = body.action; // 'add_inventory', 'record_sale'

        if (action === 'add_inventory') {
            const inventory = getData(inventoryFile);
            const newItem = {
                id: `inv_${Date.now()}`,
                name: body.name,
                platform: body.platform, // Z2U, PlayerUp, etc.
                purchasePrice: Number(body.purchasePrice),
                status: 'In Stock',
                purchaseDate: new Date().toISOString().split('T')[0],
                accountDetails: {
                    username: body.username || '',
                    password: body.password || '',
                    email: body.email || '',
                    extraInfo: body.extraInfo || ''
                }
            };
            inventory.push(newItem);
            saveData(inventoryFile, inventory);
            return NextResponse.json(newItem);
        }

        if (action === 'record_sale') {
            const inventory = getData(inventoryFile);
            const balanceHistory = getData(balanceFile);

            let deliveryData = null;

            // Update Inventory Item Logic
            if (body.inventoryId) {
                const itemIndex = inventory.findIndex((i: any) => i.id === body.inventoryId);
                if (itemIndex > -1) {
                    inventory[itemIndex].status = 'Sold';
                    // Generate Delivery Info
                    // Generate Delivery Info
                    if (inventory[itemIndex].accountDetails) {
                        const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
                        deliveryData = {
                            token,
                            details: inventory[itemIndex].accountDetails,
                            itemName: inventory[itemIndex].name,
                            proofImage: body.proofImage || null
                        };

                        // Save delivery token mapping
                        const deliveriesFile = path.join(process.cwd(), 'data', 'deliveries.json');
                        const deliveries = fs.existsSync(deliveriesFile) ? JSON.parse(fs.readFileSync(deliveriesFile, 'utf8')) : [];
                        deliveries.push({
                            token,
                            orderId: `trans_${Date.now()}`,
                            details: inventory[itemIndex].accountDetails,
                            itemName: inventory[itemIndex].name,
                            proofImage: body.proofImage || null,
                            timestamp: new Date().toISOString()
                        });
                        fs.writeFileSync(deliveriesFile, JSON.stringify(deliveries, null, 2));
                    }
                    saveData(inventoryFile, inventory);
                }
            }

            // Record Transaction
            const newTransaction = {
                id: `trans_${Date.now()}`,
                type: 'sale',
                platform: body.platform,
                amount: Number(body.salePrice),
                description: body.description || 'Direct Sale',
                processedBy: body.staffName || 'Admin',
                date: new Date().toISOString().split('T')[0],
                inventoryId: body.inventoryId || null
            };
            balanceHistory.push(newTransaction);
            saveData(balanceFile, balanceHistory);

            return NextResponse.json({
                success: true,
                transaction: newTransaction,
                delivery: deliveryData // Return the data to FE
            });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}
