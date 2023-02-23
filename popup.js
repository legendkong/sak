let scrapeEmails = document.getElementById("scrapeEmails")
let emailList = document.getElementById("emailList")

let scrapeAccountIds = document.getElementById("scrapeAccountIds")
let accountIdsList = document.getElementById("accountIdsList")

// Handler to receive emails from content script
chrome.runtime.onMessage.addListener((request, sender, sendReponse) => {
  // Get emails
  let emails = request.emails
  // Get accountIds
  let accountIds = request.accountArray

  // Display emails on popup
  if (emails == null || emails.length == 0) {
    // If no emails found
    let liEmails = document.createElement("li")
    liEmails.innerText = "No emails found"
    emailList.appendChild(liEmails)
  } else {
    // Display emails
    emails.forEach((email) => {
      let liEmails = document.createElement("li")
      liEmails.innerText = email
      emailList.appendChild(liEmails)
    })
  }
  // Display account IDs on popup
  if (accountIds == null || accountIds.length == 0) {
    // If no accountIds found
    let liAccountIds = document.createElement("li")
    liAccountIds.innerText = "No account_ids found"
    accountIdsList.appendChild(liAccountIds)
  } else {
    // Display accountIds
    accountIds.forEach((accountIds) => {
      let liAccountIds = document.createElement("li")
      liAccountIds.innerText = accountIds
      accountIdsList.appendChild(liAccountIds)
    })
  }
})

// Button's click event listener
scrapeEmails.addEventListener("click", async () => {
  // Get current active tab of window
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

  // Execute script to parse emails on page
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: scrapeEmailsFromPage
  })
})
scrapeAccountIds.addEventListener("click", async () => {
  // Get current active tab of window
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

  // Execute script to parse accountIds on page
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: scrapeAccountIdsFromPage
  })
})

// Function to scrape emails
function scrapeEmailsFromPage() {
  // RegEx to parse emails from html code
  const emailRegEx = /[\w\.=-]+@[\w\.-]+\.[\w]{2,3}/gim

  // Parse emails from the HTML of the page
  let emails = document.body.innerHTML.match(emailRegEx)
  console.log(emails)
  // Send emails to popup
  chrome.runtime.sendMessage({ emails })
}

// Function to scrape accountIds
function scrapeAccountIdsFromPage() {
  // RegEx to parse accountIds from html code
  const accountIdsRegEx =
    /(https?:\/\/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9])(:?\d*)\/?([a-z_\/0-9\-#.]*)\??([a-z_\/0-9\-#=&]*)/g

  // Parse accountIds array from the HTML of the page
  let accountIds = document.body.innerHTML.match(accountIdsRegEx)

  let accountArray = []
  for (var i = 0; i < accountIds.length; i++) {
    var match = /^(?:\.)?([^.]+)/.exec(accountIds[i])
    function removeHttp(match) {
      return match.replace(/^https?:\/\//, "")
    }
    var result = removeHttp(match[1])
    accountArray.push(result)
    accountArray = accountArray.filter((e) => e !== "github")
    accountArray = accountArray.filter((e) => e !== "monitor")
  }
  accountArray = [...new Set(accountArray)]
  console.log(accountArray)

  // Send accountIds to popup
  chrome.runtime.sendMessage({ accountArray })
}
