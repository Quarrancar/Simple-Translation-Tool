const fromText = document.querySelector(".from-text");
const toText = document.querySelector(".to-text");
const exchangeIcon = document.querySelector(".exchange");
const selectTag = document.querySelectorAll("select");
const translateBtn = document.querySelector("button");

// Asynchronous function to fetch and populate country data
async function populateLanguages() {
    const countries = await import('./countries.js').then(module => module.default);
    selectTag.forEach((tag, index) => {
        for (let countryCode in countries) {
            const isSelected = (index === 0 && countryCode === "en-GB") || (index === 1 && countryCode === "de-DE");
            const option = `<option ${isSelected ? "selected" : ""} value="${countryCode}">${countries[countryCode]}</option>`;
            tag.insertAdjacentHTML("beforeend", option);
        }
    });
}

// Swap the language and text between the two textareas
function exchangeLanguagesAndText() {
    [fromText.value, toText.value] = [toText.value, fromText.value];
    [selectTag[0].value, selectTag[1].value] = [selectTag[1].value, selectTag[0].value];
}

exchangeIcon.addEventListener("click", exchangeLanguagesAndText);

fromText.addEventListener("keyup", () => {
    if (!fromText.value) {
        toText.value = "";
    }
});

translateBtn.addEventListener("click", () => {
    const text = fromText.value.trim();
    const translateFrom = selectTag[0].value;
    const translateTo = selectTag[1].value;

    if (!text) return;

    toText.placeholder = "Translating...";
    const apiUrl = `https://api.mymemory.translated.net/get?q=${text}&langpair=${translateFrom}|${translateTo}`;

    fetch(apiUrl)
        .then(res => res.json())
        .then(data => {
            toText.value = data.responseData.translatedText;
        })
        .catch(err => {
            console.error("Translation API Error:", err);
            toText.value = "Translation Error";
        })
        .finally(() => {
            toText.placeholder = "Translation";
        });
});

// Manage copy and speech functionality
document.querySelectorAll(".row i").forEach(icon => {
    icon.addEventListener("click", event => {
        const targetText = icon.id === "from" ? fromText.value : toText.value;
        if (!targetText) return;

        if (icon.classList.contains("fa-copy")) {
            navigator.clipboard.writeText(targetText);
        } else {
            const lang = selectTag[icon.id === "from" ? 0 : 1].value;
            const utterance = new SpeechSynthesisUtterance(targetText);
            utterance.lang = lang;
            speechSynthesis.speak(utterance);
        }
    });
});


// Add styling via eventListeners on translation
translateBtn.addEventListener("click", () => {
    let text = fromText.value.trim();
    text = text.replace(/\n/g, "<br>"); // Replace line breaks with <br> tags before sending for translation
    
    const translateFrom = selectTag[0].value;
    const translateTo = selectTag[1].value;

    if (!text) return;

    toText.placeholder = "Translating...";
    const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${translateFrom}|${translateTo}`;

    fetch(apiUrl)
        .then(res => res.json())
        .then(data => {
            // Replace <br> tags with actual line breaks after translation
            let translatedText = data.responseData.translatedText.replace(/<br>/g, "\n");
            toText.value = translatedText;
        })
        .catch(err => {
            console.error("Translation API Error:", err);
            toText.value = "Translation Error";
        })
        .finally(() => {
            toText.placeholder = "Translation";
        });
});


// Call the populateLanguages function to initialize the language options asynchronously
populateLanguages();