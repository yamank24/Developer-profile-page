import { Octokit } from "https://esm.sh/octokit";
let totalItems = 10;
let currentPage = 1;
let itemsPerPage = 10;
let totalPages = 1;

let username = "";
function getProjectCard(cardObj) {
  var boxDiv = document.createElement("div");
  boxDiv.className = "box";

  // Create main heading (h1)
  var heading = document.createElement("h1");
  heading.textContent = cardObj.heading;
  boxDiv.appendChild(heading);

  // Create subheading (h2)
  var subheading = document.createElement("h2");
  subheading.textContent = cardObj.subHeading;
  boxDiv.appendChild(subheading);

  // Create horizontal list (ul)
  var list = document.createElement("ul");

  // Add list items (li) to the horizontal list
  for (var i = 0; i < 5; i++) {
    if (cardObj.topics[i]) {
      var listItem = document.createElement("li");
      listItem.textContent = cardObj.topics[i];
      list.appendChild(listItem);
    }
  }

  // Append the horizontal list to the main container div
  boxDiv.appendChild(list);

  // Append the main container div to the body of the document
  //   document.body.appendChild(boxDiv);
  return boxDiv;
}

export const addNewProject = (cardObj) => {
  const projectsWrapper = document.getElementById("projects-wrapper");
  const projectCard = getProjectCard(cardObj);
  projectsWrapper.appendChild(projectCard);
};

function getUrlParams() {
  // Get the URL search parameters
  const urlParams = new URLSearchParams(window.location.search);

  // Create an object to store the parameters
  const params = {};

  // Iterate over each parameter and store it in the object
  for (const [key, value] of urlParams.entries()) {
    params[key] = value;
  }

  return params;
}

async function getUserInfo() {
  try {
    const octokit = new Octokit({
      auth: "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",
    });
    const { data } = await octokit.request("GET /users/" + username, {
      username,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    return data;
  } catch (e) {
    console.error(e);
  }
}

async function getUserRepos() {
  const octokit = new Octokit({
    auth: "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",
  });
  try {
    const { data: repos } = await octokit.request(
      "GET /users/" + username + "/repos",
      {
        per_page: itemsPerPage,
        page: currentPage,
        sort: "pushed",
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );
    return repos;
  } catch (e) {
    console.error(e);
  }
}

// Function to change items per page
export function changeItemsPerPage() {
  itemsPerPage = parseInt(document.getElementById("itemsPerPage").value, 10);
  currentPage = 1;
  totalPages = Math.ceil(totalItems / itemsPerPage);
  displayItems();
  generatePaginationLinks();
  updatePaginationUI();
}

const displayInfo = async () => {
  const userDetails = await getUserInfo();
  totalItems = userDetails.public_repos;
  totalPages = Math.ceil(totalItems / itemsPerPage);
  generatePaginationLinks();

  document.getElementById("userNameElement").innerHTML = userDetails.name;
  // document.getElementById("").innerHTML = userDetails.html_url;
  document.getElementById("avatar").src = userDetails.avatar_url;
  document.getElementById("userBioElement").textContent = userDetails.bio;
  document.getElementById("userLocation").innerHTML = userDetails.location;
  document.getElementById("userProfileLink").href = userDetails.html_url;
  document.getElementById("userProfileLink").textContent = userDetails.html_url;
  console.log(userDetails);
};

const displayItems = async () => {
  const userRepos = await getUserRepos();

  // setting total pages
  document.getElementById("projects-wrapper").innerHTML = "";
  userRepos.forEach((repo) => {
    const elementObj = {
      id: repo.id,
      heading: repo.name,
      subHeading: repo.description,
      topics: repo.topics,
      technologies: [repo.language],
    };
    addNewProject(elementObj);
  });
};

function generatePaginationLinks() {
  const paginationContainer = document.getElementById("pagination");
  paginationContainer.innerHTML = "";

  // Add "Previous" button
  const prevButton = document.createElement("li");
  prevButton.textContent = "Previous";
  prevButton.addEventListener("click", () => goToPage(currentPage - 1));
  paginationContainer.appendChild(prevButton);

  // Add numbered pages
  const numPagesToShow = Math.min(totalPages, 5);
  let startPage = 1;
  // debugger;
  let endPage = startPage + 4;
  if (currentPage > 3) {
    startPage = currentPage - 2;
    endPage = startPage + 4;
  }
  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = endPage - 4;
  }

  for (let i = startPage; i <= endPage; i++) {
    const li = document.createElement("li");
    li.textContent = i;
    li.addEventListener("click", () => goToPage(i));
    if (i === currentPage) {
      li.classList.add("active");
    }
    paginationContainer.appendChild(li);
  }

  // Add "Next" button
  const nextButton = document.createElement("li");
  nextButton.textContent = "Next";
  nextButton.addEventListener("click", () => goToPage(currentPage + 1));
  paginationContainer.appendChild(nextButton);
}

// Function to handle page navigation
function goToPage(page) {
  // debugger;
  if (page >= 1 && page <= totalPages) {
    currentPage = page;
    displayItems();
    generatePaginationLinks();
    updatePaginationUI();
  }
}

// Function to update the appearance of the pagination links
function updatePaginationUI() {
  const paginationLinks = document.getElementById("pagination").children;

  for (let i = 1; i < paginationLinks.length; i++) {
    paginationLinks[i].classList.remove("active");
    if (currentPage >= 3 && currentPage <= totalPages - 2) {
      paginationLinks[3].classList.add("active");
    } else if (currentPage <= 5 && i === currentPage) {
      paginationLinks[i].classList.add("active");
    } else if (currentPage === totalPages) {
      paginationLinks[5].classList.add("active");
    } else if (currentPage === totalPages - 1) {
      paginationLinks[4].classList.add("active");
    }
  }
}

export const onloadListener = (e) => {
  const queryParams = getUrlParams();
  if (!queryParams.user) {
    alert("Invalid Url");
    return;
  }

  username = queryParams.user;
  displayInfo();
  displayItems();
};
