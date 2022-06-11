const menu = document.querySelector(".menu");
const nav = document.querySelector("nav");

menu.addEventListener("click", () => {
  nav.classList.toggle("close");
});

const input = document.querySelector("input");
const button = document.querySelector(".shorten button");
const shortenedResult = document.querySelector(".results");
const error = document.querySelector(".error-message");

let linkArray = [];

const apiUrl = "https://api.shrtco.de/v2/shorten?url=";

const getUrl = (url) => {
  fetch(url)
    .then((resp) => {
      return resp.json();
    })
    .then((data) => {
      // Remove error message
      error.classList.remove("error");
      input.classList.remove("error");

      // Stop Loading
      button.classList.remove("loading");
      button.textContent = "Shorten It!";
      // Add new link
      const { result } = data;
      let shortened = document.createElement("div");
      shortened.classList = "shortened";
      shortened.innerHTML = `
          <a href="${result.original_link}" target="_blank" class="long">${result.original_link}</a>
          <a href="https://${result.short_link2}" target="_blank" class="short">${result.short_link2}</a>
          <button>Copy</button>
      `;
      shortenedResult.appendChild(shortened);

      // Copy to clipboard
      copyToClipboard(shortened);

      let linkObject = {
        oLink: result.original_link,
        sLink: result.short_link2,
      };

      linkArray.push(linkObject);
      localStorage.setItem("links", JSON.stringify(linkArray));
    })
    .catch(() => {
      fetch(url)
        .then((resp) => {
          return resp.json();
        })
        .then((data) => {
          // Add error message
          input.classList.add("error");
          error.classList.add("error");
          if (data.error_code == 1) {
            error.textContent = "Please add a link";
          }
          if (data.error_code == 2) {
            error.textContent = "Enter a valid link";
          }
          if (data.error_code == 10) {
            error.textContent = "Disallowed Link";
          }
        });
    });
};

const copyToClipboard = (shortened) => {
  shortened.children[2].addEventListener("click", (e) => {
    let copyBox = document.createElement("input");
    copyBox.type = "text";
    copyBox.value = shortened.children[1].textContent;
    document.body.appendChild(copyBox);
    copyBox.select();
    document.execCommand("copy");
    document.body.removeChild(copyBox);

    e.target.style.background = "hsl(257, 27%, 26%)";
    e.target.textContent = "Copied!";

    setTimeout(() => {
      e.target.style.background = "hsl(180, 66%, 49%)";
      e.target.textContent = "Copy";
    }, 5000);
  });
};

button.addEventListener("click", () => {
  button.textContent = "...";
  button.classList.add("loading");
  let url = apiUrl + input.value;
  setTimeout(() => {
    getUrl(url);
  }, 1000);
  input.value = "";
});
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    button.textContent = "...";
    button.classList.add("loading");
    let url = apiUrl + input.value;
    setTimeout(() => {
      getUrl(url);
    }, 1000);
    input.value = "";
  }
});

window.addEventListener("load", () => {
  const storedLinks = localStorage.getItem("links");
  let parsedLinks = JSON.parse(storedLinks);

  if(parsedLinks){
    linkArray = [...parsedLinks];  
  }



  parsedLinks.forEach((e) => {
    shortened = document.createElement("div");
    shortened.classList = "shortened";
    shortened.innerHTML = `
    <a href="${e.oLink}" target="_blank" class="long">${e.oLink}</a>
    <a href="https://${e.sLink}" target="_blank" class="short">${e.sLink}</a>
    <button>Copy</button>
    `;
    shortenedResult.appendChild(shortened);
    copyToClipboard(shortened);
  });
});
