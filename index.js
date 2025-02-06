const PasswordBox = document.getElementById("final-password");

const CharacterSets = [
    {id: "UpperCase", label: "UpperCaseLetters", characters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ"},
    {id: "LowerCase", label: "LowerCaseLetters", characters: "abcdefghijklmnopqrstuvwxyz"},
    {id: "Numbers", label: "Numbers", characters: "1234567890"},
    {id: "Symbols", label: "Symbols", characters: "!#$%&/()="},
]

function toggleTheme() {
    const currentTheme = document.body.classList.contains("dark-mode") ? "dark" : "light";
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.body.classList.remove(`${currentTheme}-mode`);
    document.body.classList.add(`${newTheme}-mode`);
    localStorage.setItem("theme", newTheme);
}

function RangeAlert() {
    const PasswordLength = Number(document.getElementById("passwordlengthtext").value);
    const currentTheme = document.body.classList.contains("dark-mode") ? "dark-mode" : "light-mode";

    if (isNaN(PasswordLength) || PasswordLength < 4 || PasswordLength > 30) {
        Swal.fire({
            icon: 'warning',
            title: 'Invalid Length',
            text: 'Password length must be between 4 and 30 characters.',
            confirmButtonText: 'Got it',
            customClass: { popup: currentTheme }
        });
        return;
    }

    const CheckedSets = CharacterSets.filter(set => document.getElementById(set.id.toLowerCase()).checked);
    if (CheckedSets.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Invalid Settings',
            text: 'Please select at least one checkbox.',
            confirmButtonText: 'Got it',
            customClass: { popup: currentTheme }
        });
        return;
    }

    let password = "";
    password += CheckedSets[Math.floor(Math.random() * CheckedSets.length)].characters[Math.floor(Math.random() * CheckedSets[0].characters.length)];

    while (password.length < PasswordLength) {
        const RandomCharacters = CheckedSets[Math.floor(Math.random() * CheckedSets.length)];
        password += RandomCharacters.characters[Math.floor(Math.random() * RandomCharacters.characters.length)];
    }

    PasswordBox.value = password;

    const savehistory = JSON.parse(localStorage.getItem("passwordHistory")) || [];
    savehistory.push({ password, timestamp: Date.now() });
    localStorage.setItem("passwordHistory", JSON.stringify(savehistory));

    displayPasswordHistory();
}

function displayPasswordHistory() {
    const history = JSON.parse(localStorage.getItem("passwordHistory")) || [];
    const ListedHistory = document.getElementById("history-list");

    ListedHistory.innerHTML = "";
    history.forEach((entry) => {
        const listItem = document.createElement("li");
        listItem.textContent = `Password: ${entry.password} | Created: ${new Date(entry.timestamp).toLocaleString()}`;
        ListedHistory.appendChild(listItem);
    });
}

document.getElementById("theme-toggle").addEventListener("click", toggleTheme);

document.getElementById("clear-history").addEventListener("click", function () {
    const currentTheme = document.body.classList.contains("dark-mode") ? "dark-mode" : "light-mode";

    Swal.fire({
        title: 'Are you sure?',
        text: "This will delete all your password history!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, clear it!',
        cancelButtonText: 'No, keep it',
        customClass: {
            popup: currentTheme,
            confirmButton: `${currentTheme} swal2-confirm`,
            cancelButton: `${currentTheme} swal2-cancel`
        }
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem("passwordHistory");
            displayPasswordHistory();
            Swal.fire({
                title: 'Cleared!',
                text: 'Your password history has been deleted.',
                icon: 'success',
                customClass: { popup: currentTheme }
            });
        }
    });
});

document.getElementById("export-history").addEventListener("click", function() {
    const history = JSON.parse(localStorage.getItem("passwordHistory"));
    if (history && history.length > 0) {
        const historyText = history
            .map(entry => `Password: ${entry.password} | Created: ${new Date(entry.timestamp).toLocaleString()}`)
            .join('\n');

        const a = document.createElement("a");
        a.href = "data:text/plain;charset=utf-8," + encodeURIComponent(historyText);
        a.download = "PasswordHistory.txt";
        a.click();
    } else {
        alert("No history to export.");
    }
});

function passwordcopied() {
    const copyText = document.getElementById("final-password");
    const currentTheme = document.body.classList.contains("dark-mode") ? "dark-mode" : "light-mode";

    copyText.select();
    navigator.clipboard.writeText(copyText.value);
    Swal.fire({
        title: 'Copied!',
        text: 'Copied the text: ' + copyText.value,
        icon: 'success',
        customClass: { popup: currentTheme }
    });
}

async function loadSecurityTips() {
    try {
        const response = await fetch("security-tips.json");
        if (!response.ok) throw new Error("Failed to load security tips.");

        const tips = await response.json();
        const tipsContainer = document.getElementById("Security-Tips");

        tips.forEach(tip => {
            const tipItem = document.createElement("li");
            tipItem.textContent = tip.tip;
            tipsContainer.appendChild(tipItem);
        });
    } catch (error) {
        console.error("Error loading security tips:", error);
    }
}

function checkPasswordStrength(password) {
    const currentTheme = document.body.classList.contains("dark-mode") ? "dark-mode" : "light-mode";

    if (!password || password.trim() === "") {
        Swal.fire({
            icon: 'warning',
            title: 'Oops!',
            text: 'Please enter a password to check.',
            customClass: { popup: currentTheme }
        });
        return;
    }

    const result = zxcvbn(password);
    const strengthLevels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
    const strengthMessage = strengthLevels[result.score];

    Swal.fire({
        title: 'Password Strength',
        text: `Strength: ${strengthMessage}. Suggestions: ${result.feedback.suggestions.length > 0 ? result.feedback.suggestions.join(" ") : "None"}`,
        icon: result.score >= 3 ? 'success' : 'warning',
        customClass: { popup: currentTheme }
    });
}


window.onload = function () {
    const storedTheme = localStorage.getItem("theme") || "dark";
    document.body.classList.add(`${storedTheme}-mode`);
    displayPasswordHistory();
    loadSecurityTips();

    document.getElementById("ManualPasswordCheck").addEventListener("click", () => {
        const userPassword = document.getElementById("ManualPassword").value;
        const currentTheme = document.body.classList.contains("dark-mode") ? "dark-mode" : "light-mode";

        if (userPassword.trim() === "") {
            Swal.fire({
                icon: 'warning',
                title: 'Oops!',
                text: 'Please enter a password to check.',
                customClass: { popup: currentTheme }
            });
            return;
        }
        checkPasswordStrength(userPassword);
    });

    document.getElementById("GeneratedPasswordCheck").addEventListener("click", function () {
        const generatedPassword = document.getElementById("final-password").value;
        const currentTheme = document.body.classList.contains("dark-mode") ? "dark-mode" : "light-mode";

        if (generatedPassword.trim() === "") {
            Swal.fire({
                icon: 'warning',
                title: 'Oops!',
                text: 'Generate a password first before checking.',
                customClass: { popup: currentTheme }
            });
            return;
        }
        checkPasswordStrength(generatedPassword);
    });
};