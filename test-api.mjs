
async function testApi() {
    try {
        const response = await fetch('http://localhost:3001/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'generate-greeting',
                name: 'TestUser',
                newAddress: { prefecture: 'Tokyo', city: 'Minato' },
                hobbies: 'Coding'
            })
        });

        if (!response.ok) {
            console.error('Response status:', response.status);
            const text = await response.text();
            console.error('Response text:', text);
        } else {
            const data = await response.json();
            console.log('Success:', data);
        }

    } catch (error) {
        console.error('Fetch error:', error);
    }
}

testApi();
