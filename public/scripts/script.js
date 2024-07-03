document.getElementById('askButton').addEventListener('click', async function () {
    const question = document.getElementById('questionInput').value;

    if (question.trim() === "") {
        alert("Please enter a question.");
        return;
    }

    const response = await fetch('/generate-story', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: question })
    });

    const data = await response.json();
    const answerContainer = document.getElementById('answerContainer');
    
    if (data.error) {
        answerContainer.textContent = 'Error: ' + data.error;
    } else {
        answerContainer.textContent = data.story;
    }
});
