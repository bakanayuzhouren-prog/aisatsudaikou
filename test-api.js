
// Uses global fetch (available in Node 18+)

async function testApi() {
    try {
        // Create a small 1x1 white pixel base64 jpeg for testing
        const dummyBase64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDAREAAhEBAxEB/8HAAH/xAAfAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgv/xAC1EAACAQMDAgQDBQUEBAAAAX0BAgMABBEFEiExQQYTUWEHInEUMoGRoQgjQrHBFVLR8CQzYnKCCQoWFxgZGiUmJygpKjQ1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4eLj5OXm5+jp6vHy8/T19vf4+fr/xAAfAQADAQEBAQEBAQEBAAAAAAAAAQIDBAUGBwgJCgv/xAC1EQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQcRMiMMEQQAIf/2wAIAQRSBAQAAAAAAQ//2Q==";

        console.log('Testing transform-image...');
        const response = await fetch('http://127.0.0.1:3001/api/gemini', { // Use 127.0.0.1 to avoid localhost resolution issues
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'transform-image',
                image: dummyBase64,
                style: 'watercolor'
            })
        });

        if (!response.ok) {
            console.error('Response status:', response.status);
            const text = await response.text();
            console.error('Response text (raw):', text);
            try {
                const jsonError = JSON.parse(text);
                console.error('Parsed Error Details:', JSON.stringify(jsonError, null, 2));
            } catch (e) {
                // ignore if not json
            }
        } else {
            const data = await response.json();
            console.log('Success (keys):', Object.keys(data));
            if (data.text) {
                console.log('Received Text instead of Image:', data.text);
            }
        }

    } catch (error) {
        console.error('Fetch error:', error);
    }
}

testApi();
