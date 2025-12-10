import http from 'http';

const POST = (path: string, body: any): Promise<any> => {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(body);
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api' + path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = http.request(options, res => {
            let buffer = '';
            res.on('data', d => buffer += d);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(buffer));
                } catch (e) {
                    resolve({ raw: buffer });
                }
            });
        });
        
        req.on('error', error => {
            reject(error);
        });
        
        req.write(data);
        req.end();
    });
};

const GET = (path: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api' + path,
            method: 'GET'
        };

        const req = http.request(options, res => {
            let buffer = '';
            res.on('data', d => buffer += d);
            res.on('end', () => {
                 try {
                    resolve(JSON.parse(buffer));
                } catch (e) {
                    resolve({ raw: buffer });
                }
            });
        });
        
        req.on('error', error => {
            reject(error);
        });
        
        req.end();
    });
};

const runTests = async () => {
    console.log('--- Starting Backend Tests ---');
    const userId = 'test-user-' + Date.now();
    const gameName = 'pattern';

    // 1. Start Game
    console.log(`\n1. Starting Game for user ${userId}...`);
    const startRes = await POST('/games/start', { userId, gameName });
    console.log('Result:', startRes);
    if (!startRes.sessionId) throw new Error('Start Game Failed');

    const { sessionId } = startRes;

    // 2. Submit Score
    console.log(`\n2. Submitting Score (Session: ${sessionId})...`);
    // Score high enough to maybe win? Or just score
    const score = 500;
    const submitRes = await POST('/games/submit', { sessionId, score });
    console.log('Result:', JSON.stringify(submitRes, null, 2));
    
    if (submitRes.status !== 'completed') throw new Error('Submit Score Failed');
    if (submitRes.coinsEarned !== 100) throw new Error(`Coins calculation wrong. Expected 100 (500*0.2), got ${submitRes.coinsEarned}`);

    // 3. Check Leaderboard
    console.log(`\n3. Checking Leaderboard for ${gameName}...`);
    const leaderboard = await GET(`/games/leaderboard/${gameName}`);
    console.log('Result:', JSON.stringify(leaderboard, null, 2));
    const entry = leaderboard.find((e: any) => e.userId === userId);
    if (!entry) throw new Error('User not found in leaderboard');
    if (entry.score !== score) throw new Error('Score mismatch in leaderboard');

    // 4. Check User Profile
    console.log(`\n4. Checking User Profile...`);
    const userProfile = await GET(`/user/${userId}`);
    console.log('Result:', userProfile);
    if (userProfile.userId !== userId) throw new Error('User profile fetch failed');
    if (userProfile.coinsBalance !== 100) throw new Error('User balance mismatch');

    // 5. Test Webhook (Cart Abandonment Trigger)
    console.log(`\n5. Testing Cart Abandonment Trigger...`);
    // First create a cart via "webhook"
    const cartId = 'cart-' + Date.now();
    await POST('/webhooks/fynd/cart', {
        event: 'application/cart/create/v1',
        payload: {
            cartId,
            userId,
            items: [{ id: 1, name: 'Test Item' }],
            cartValue: 5000
        }
    });

    // Then trigger abandonment
    const triggerRes = await POST('/webhooks/boltic/trigger-abandonment', { cartId });
    console.log('Result:', triggerRes);
    if (triggerRes.status !== 'notification_sent') throw new Error('Abandonment trigger failed');
    if (!triggerRes.gameLink) throw new Error('Game link missing');

    console.log('\n--- ALL TESTS PASSED ---');
};

runTests().catch(err => {
    console.error('\n!!! TESTS FAILED !!!');
    console.error(err);
    process.exit(1);
});
