document.addEventListener("DOMContentLoaded", function () {
    const { jsPDF } = window.jspdf;
    let doc = new jsPDF();

    function generateQuestions() {
        let minNumInput = document.getElementById("min-number");
        let maxNumInput = document.getElementById("max-number");
        let numQuestionsInput = document.getElementById("num-questions");
        let twoNumbersInput = document.getElementById("twonumbers");
        let threeNumbersInput = document.getElementById("threenumbers");
        let fontSizeInput = document.querySelector('input[name="question-fontsize"]:checked'); // Get selected font size
    
        if (!minNumInput || !maxNumInput || !numQuestionsInput || !twoNumbersInput || !threeNumbersInput || !fontSizeInput) {
            console.error("One or more input elements are missing. Check your HTML IDs and names.");
            return [];
        }
    
        let minNum = parseInt(minNumInput.value);
        let maxNum = parseInt(maxNumInput.value);
        let numQuestions = parseInt(numQuestionsInput.value);
        let selectedFontSize = fontSizeInput.value + "px"; // Get font size as a string
    
        if (minNum > maxNum) {
            alert("Minimum number cannot be greater than maximum number.");
            return [];
        }
        if (numQuestions < 1 || numQuestions > 60) {
            alert("Number of questions must be between 1 and 60.");
            return [];
        }
    
        let numTerms = twoNumbersInput.checked ? 2 : 3;
    
        let questionsSet = new Set();
        let questions = [];
        let attempts = 0;
        let maxAttempts = numQuestions * 5;
    
        while (questions.length < numQuestions && attempts < maxAttempts) {
            let nums = [];
            let terms = [];
    
            for (let i = 0; i < numTerms; i++) {
                let num = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
                nums.push(num);
    
                let operator = i === 0 ? "" : Math.random() < 0.5 ? "+" : "-";
    
                // Apply parentheses only for negative numbers
                if (i > 0 && num < 0) {
                    terms.push(`${operator} (${num})`);
                } else {
                    terms.push(`${operator} ${num}`);
                }
            }
    
            let questionText = terms.join(" ").trim() + " = ";
    
            if (!questionsSet.has(questionText)) {
                questionsSet.add(questionText);
                let questionObj = {
                    text: questionText,
                    num1: nums[0],
                    operator1: numTerms >= 2 ? (nums[1] >= 0 ? "+" : "-") : "",
                    num2: nums[1],
                    operator2: numTerms === 3 ? (nums[2] >= 0 ? "+" : "-") : "",
                    num3: nums[2] || null,
                    fontSize: selectedFontSize // Store font size in question object
                };
                questions.push(questionObj);
            }
    
            attempts++;
        }
    
        console.log("Final Generated Questions:", questions);
        return questions;
    }
    
    
    function previewWorksheet() {
        const previewContainer = document.getElementById("worksheet-preview");
    
        if (!previewContainer) {
            console.error("Preview container not found!");
            return;
        }
    
        previewContainer.innerHTML = "";
        previewContainer.style.backgroundColor = "white";
        previewContainer.style.padding = "20px";
        previewContainer.style.display = "flex";
        previewContainer.style.flexDirection = "column";
        previewContainer.style.alignItems = "center";
    
        const title = document.getElementById("title").value || "Math Worksheet";
        const titleColor = document.getElementById("titleColor").value;
        const fontStyle = document.getElementById("fontStyle").value;
        const titleFontSize = document.getElementById("titleFontSize").value + "px";
    
        const titleElement = document.createElement("h2");
        titleElement.textContent = title;
        titleElement.style.color = titleColor;
        titleElement.style.fontSize = titleFontSize;
        titleElement.style.fontFamily = fontStyle;
        titleElement.style.textAlign = "center";
    
        previewContainer.appendChild(titleElement);
    
        const questions = generateQuestions();
        console.log("Generated Questions:", questions);  // Debugging log
    
        if (!questions || questions.length === 0) {
            console.error("No questions generated!");
            return;
        }
    
        const questionContainer = document.createElement("div");
        const numColumns = parseInt(document.getElementById("columns").value) || 2;
        const spacing = parseInt(document.getElementById("spacing").value) || 10;
    
        questionContainer.style.display = "grid";
        questionContainer.style.gridTemplateColumns = `repeat(${numColumns}, 1fr)`;
        questionContainer.style.gap = `${spacing}px`;
        questionContainer.style.width = "100%";
        questionContainer.style.maxWidth = "800px";
        questionContainer.style.marginTop = "10px";
        previewContainer.appendChild(questionContainer);
    
        // Get selected font size (Fix applied)
        const selectedFontSize = (document.querySelector('input[name="question-fontsize"]:checked')?.value || "14") + "px";
    
        questions.forEach(q => {
            const questionWrapper = document.createElement("div");
            questionWrapper.style.textAlign = "center";
            questionWrapper.style.whiteSpace = "nowrap";
            questionWrapper.style.padding = "10px";
            questionWrapper.style.fontSize = selectedFontSize; // Apply the selected font size
    
            if (q.text) {
                questionWrapper.textContent = q.text;
                questionContainer.appendChild(questionWrapper);
            }
        });
    }
    
    
    function downloadPDF() {
        let orientation = document.querySelector('input[name="orientation"]:checked').value;
        let doc = new jsPDF({
            orientation: orientation === "landscape" ? "l" : "p",
            unit: "in",
            format: "letter"
        });
    
        let title = document.getElementById("title").value || "Math Worksheet";
        let numColumns = parseInt(document.getElementById("columns").value) || 3;
        let spacing = parseFloat(document.getElementById("spacing").value) / 72 || 0.5;
        let questions = generateQuestions();
        console.log("Generated Questions for PDF:", questions);  // Debugging log
    
        let pageWidth = orientation === "landscape" ? 11 : 8.5;
        let pageHeight = orientation === "landscape" ? 8.5 : 11;
        let marginLeft = 0.5;
        let startY = 2;
    
        // Get the selected font size (Fix applied)
        const selectedFontSize = parseInt(document.querySelector('input[name="question-fontsize"]:checked')?.value || "14");
    
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("Full Name: ____________________", marginLeft, 0.5);
        doc.text("Date: _______________", pageWidth - 3, 0.5);
    
        doc.setFontSize(16);
        doc.text(title, pageWidth / 2, 1.2, { align: "center" });
    
        let yPosition = startY;
        let xPosition = marginLeft;
        let columnWidth = (pageWidth - marginLeft * 2) / numColumns;
    
        // Set the selected font size for questions
        doc.setFontSize(selectedFontSize);
    
        questions.forEach((q, index) => {
            if (q.text) {
                doc.text(q.text, xPosition, yPosition);
            }
    
            xPosition += columnWidth;
    
            if ((index + 1) % numColumns === 0) {
                xPosition = marginLeft;
                yPosition += spacing;
            }
    
            // If we reach the end of the page, add a new page
            if (yPosition + spacing > pageHeight - 0.5) {
                doc.addPage();
                yPosition = startY;
            }
        });
    
        doc.save("worksheet.pdf");
    }
    
    
    function downloadImage() {
        const previewContainer = document.getElementById("worksheet-preview");
    
        if (!previewContainer) {
            console.error("Worksheet preview not found!");
            return;
        }
    
        // Ensure the preview is fully rendered before capturing
        setTimeout(() => {
            html2canvas(previewContainer, { scale: 2 }).then(canvas => {
                const link = document.createElement("a");
                link.href = canvas.toDataURL("image/png");
                link.download = "worksheet.png";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }).catch(error => {
                console.error("Error capturing image:", error);
            });
        }, 500);
}
    
    
    document.getElementById("preview-worksheet").addEventListener("click", previewWorksheet);
    document.getElementById("download-pdf").addEventListener("click", downloadPDF);
    document.getElementById("download-image").addEventListener("click", downloadImage);

});
