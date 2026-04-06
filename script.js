//http://localhost:8000
//python3 -m http.server


const TOTAL_PAGES = 9;   // change to your number of txt pages

let currentLeftPage = 1;
let footnotes = [];
let imageFootnotes = [];

const leftPageDiv = document.getElementById("leftPage");
const rightPageDiv = document.getElementById("rightPage");

const leftArrow = document.getElementById("leftArrow");
const rightArrow = document.getElementById("rightArrow");


async function loadIntro(){

    try{
        const response = await fetch("intro.txt");
        const text = await response.text();

        document.getElementById("introText").textContent = text;
    }
    catch{
        document.getElementById("introText").textContent = "Intro could not be loaded.";
    }

}

loadIntro();

async function loadImageFootnotes(){

    const response = await fetch("imagefootnotes.txt");
    const raw = await response.text();

    const sections = raw.split("IMAGE").slice(1);

    sections.forEach(section => {

        const lines = section.trim().split("\n");

        const header = lines[0].trim();
        const parts = header.split(" ");

        const page = parseInt(parts[0]);
        const phrase = parts.slice(1).join(" ");

        const image = lines[1].trim();
        const text = lines.slice(2).join("\n").trim();

        imageFootnotes.push({
            page:page,
            phrase:phrase,
            image:image,
            text:text
        });

    });

}

async function loadFootnotes(){

    const response = await fetch("footnotes.txt");
    const raw = await response.text();

    const sections = raw.split("FOOTNOTE").slice(1);

    sections.forEach(section => {

        const lines = section.trim().split("\n");

        const header = lines[0].trim();

        const parts = header.split(" ");

        const page = parseInt(parts[0]);
        const phrase = parts.slice(1).join(" ");

        const text = lines.slice(1).join("\n").trim();

        footnotes.push({
            page:page,
            phrase:phrase,
            text:text
        });

    });

}

async function loadPage(pageNumber){

    if(pageNumber > TOTAL_PAGES) return "";

    try{
        const response = await fetch(`page${pageNumber}.txt`);
        return await response.text();
    }
    catch{
        return "";
    }
}

function showImageFootnote(index){

    const fn = imageFootnotes[index];

    const box = document.getElementById("footnoteBox");

    document.getElementById("footnoteRef").textContent =
        `Page ${fn.page}: ${fn.phrase}`;

    document.getElementById("footnoteText").innerHTML =
        `<img src="${fn.image}" style="max-width:100%; display:block; margin:10px auto;">
         <p>${fn.text}</p>`;

    box.style.display = "block";

}

function applyFootnotes(pageNumber, text){

    let html = text;

    footnotes.forEach((fn, index) => {

        if(fn.page === pageNumber){

            const link = `<span class="footnote-link" onclick="showFootnote(${index})">${fn.phrase}</span>`;
            html = html.replace(fn.phrase, link);

        }

    });

    imageFootnotes.forEach((fn, index) => {

        if(fn.page === pageNumber){

            const link = `<span class="footnote-link" onclick="showImageFootnote(${index})">${fn.phrase}</span>`;
            html = html.replace(fn.phrase, link);

        }

    });

    return html;
}

function showFootnote(index){

    const fn = footnotes[index];

    const box = document.getElementById("footnoteBox");

    document.getElementById("footnoteRef").textContent =
        `Page ${fn.page}: ${fn.phrase}`;

    document.getElementById("footnoteText").textContent =
        fn.text;

    box.style.display = "block";

}

async function renderPages(){

    const leftText = await loadPage(currentLeftPage);
    const rightText = await loadPage(currentLeftPage + 1);

    leftPageDiv.innerHTML = applyFootnotes(currentLeftPage, leftText);
    rightPageDiv.innerHTML = applyFootnotes(currentLeftPage+1, rightText);

    updateArrows();
}


function updateArrows(){

    if(currentLeftPage <= 1){
        leftArrow.style.visibility = "hidden";
    }else{
        leftArrow.style.visibility = "visible";
    }

    if(currentLeftPage + 1 >= TOTAL_PAGES){
        rightArrow.style.visibility = "hidden";
    }else{
        rightArrow.style.visibility = "visible";
    }

}

function renderImageGallery(){

    const gallery = document.getElementById("imageGallery");

    imageFootnotes.forEach(fn => {

        const item = document.createElement("div");
        item.className = "gallery-item";

        item.innerHTML = `
            <img src="${fn.image}" onclick="openLightbox('${fn.image}')">
            <div class="gallery-caption">
                <b>Page ${fn.page}: ${fn.phrase}</b><br>
                ${fn.text}
            </div>
        `;

        gallery.appendChild(item);

    });

}

const introWrapper = document.getElementById("introWrapper");

introWrapper.addEventListener("click", () => {

    introWrapper.classList.toggle("intro-collapsed");

});

function closeFootnote(){

    document.getElementById("footnoteBox").style.display = "none";

}

function openLightbox(src){

    const box = document.getElementById("imageLightbox");
    const img = document.getElementById("lightboxImg");

    img.src = src;

    box.style.display = "flex";

}

function closeLightbox(){

    document.getElementById("imageLightbox").style.display = "none";

}

leftArrow.onclick = () => {
    currentLeftPage -= 2;
    if(currentLeftPage < 1) currentLeftPage = 1;
    renderPages();
};


rightArrow.onclick = () => {
    currentLeftPage += 2;
    renderPages();
};


(async () => {

    await loadFootnotes();
    await loadImageFootnotes();

    renderPages();
    renderImageGallery();

})();