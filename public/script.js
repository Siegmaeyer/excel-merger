document.getElementById("uploadForm").addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const files = document.getElementById("files").files;
    if (!files.length) {
      alert("Please select at least one file");
      return;
    }
  
    const formData = new FormData();
    for (let file of files) {
      formData.append("files", file);
    }
  
    const response = await fetch("/merge", {
      method: "POST",
      body: formData,
    });
  
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.getElementById("downloadLink");
      link.href = url;
      link.download = "merged.xlsx";
      link.style.display = "block";
      link.textContent = "Download Merged File";
    } else {
      alert("Error merging files");
    }
  });

const uploadForm = document.getElementById("uploadForm");
const filesInput = document.getElementById("files");
const downloadLink = document.getElementById("downloadLink");
const resetBtn = document.getElementById("resetBtn");

uploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const files = filesInput.files;
    if (!files.length) {
      alert("Please select at least one file");
      return;
    }
  
    const formData = new FormData();
    for (let file of files) {
      formData.append("files", file);
    }
  
    const response = await fetch("/merge", {
      method: "POST",
      body: formData,
    });
  
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
  
      downloadLink.href = url;
      downloadLink.download = "merged.xlsx";
      downloadLink.style.display = "block";
      downloadLink.textContent = "Download Merged File";
  
      resetBtn.style.display = "block"; // show reset button
    } else {
      alert("Error merging files");
    }
  });
  
  // Reset / Start Over
  resetBtn.addEventListener("click", () => {
    uploadForm.reset();          // clears the file input
    downloadLink.style.display = "none"; 
    resetBtn.style.display = "none"; 
  });