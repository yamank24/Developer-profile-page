const getProfileDetails = () => {};
const currentPage = 1;
const currentPageLimit = 10;
let username = "";
import { Octokit, App } from "https://esm.sh/octokit";
const octokit = new Octokit({
  auth: "XXX",
});
export const getGeographicalLocation = () => {
  const url = "https://get.geojs.io/v1/ip/country.json";
  return fetch(url, {
    method: "GET",
  });
};

export const onBtnClick = (e) => {
  const apiRes = getGeographicalLocation();
  apiRes
    .then((res) => res.json())
    .then((res) => {
      console.log(res);
      alert("Hello from " + res.name);
    })
    .catch((e) => console.error(e));
};

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

export function fetchData() {
  // Path to the local file (adjust the path based on your file structure)
  const filePath = "mockData.json";

  // Use the Fetch API to get the data
  fetch(filePath)
    .then((response) => {
      // Check if the response is successful (status code in the range 200-299)
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // Parse the response as JSON
      return response.json();
    })
    .then((res) => {
      const data = res.data;
      // Handle the data
      console.log("Data from local file:", data);
      data.forEach((element) => {
        addNewProject(element);
      });
    })
    .catch((error) => {
      // Handle errors
      console.error("Fetch error:", error);
    });
}

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
  try {
    const { data: repos } = await octokit.request(
      "GET /users/" + username + "/repos",
      {
        per_page: 10,
        page: 1,
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

export const onloadListener = async (e) => {
  const queryParams = getUrlParams();
  if (!queryParams.user) {
    alert("Invalid Url");
    return;
  }

  username = queryParams.user;
  const userDetails = await getUserInfo();
  const userRepos = await getUserRepos();
  document.getElementById("userNameElement").innerHTML = userDetails.name;
  // document.getElementById("").innerHTML = userDetails.html_url;
  document.getElementById("avatar").src = userDetails.avatar_url;
  document.getElementById("userBioElement").textContent = userDetails.bio;
  document.getElementById("userLocation").innerHTML = userDetails.location;
  document.getElementById("userProfileLink").href = userDetails.html_url;
  document.getElementById("userProfileLink").textContent = userDetails.html_url;
  console.log(userRepos);
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
