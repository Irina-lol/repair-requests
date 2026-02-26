// test-race.js
const http = require('http');

const REQUEST_ID = 8;
const MASTER_ID = 2;

console.log('🧪 Тест защиты от гонки (race condition)');
console.log('========================================');
console.log(`📋 Заявка ID: ${REQUEST_ID}`);
console.log(`👤 Мастер ID: ${MASTER_ID}`);
console.log('');

console.log('🚀 Отправляем два параллельных запроса...');
console.log('');

function sendRequest(id) {
    return new Promise((resolve) => {
        const data = JSON.stringify({
            action: 'take',
            masterId: MASTER_ID
        });

        const options = {
            hostname: 'localhost',
            port: 3000,
            path: `/api/requests/${REQUEST_ID}`,
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = http.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => { responseData += chunk; });
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log(`✅ Успех (запрос ${id}): ${res.statusCode}`);
                } else if (res.statusCode === 409) {
                    console.log(`❌ Ошибка (запрос ${id}): 409 Conflict (заявка уже взята)`);
                } else {
                    console.log(`❌ Ошибка (запрос ${id}): ${res.statusCode} - ${responseData}`);
                }
                resolve();
            });
        });

        req.on('error', (error) => {
            console.log(`❌ Ошибка (запрос ${id}): ${error.message}`);
            resolve();
        });

        req.write(data);
        req.end();
    });
}

// Запускаем параллельно
Promise.all([
    sendRequest(1),
    sendRequest(2)
]).then(() => {
    console.log('');
    console.log('✅ Один запрос должен быть успешным (200), второй получить ошибку (409)');
});