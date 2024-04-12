const tabs = await chrome.tabs.query({currentWindow: true })
const collator = new Intl.Collator();
tabs.sort((a, b) => collator.compare(a.title, b.title));

const template = document.getElementById("li_template");
const elements = new Set();
for (const tab of tabs) {
  const element = template.content.firstElementChild.cloneNode(true);

  const title = tab.title?.split("-")[0]?.trim();
  let pathname;
  if (typeof tab.url === 'string') {
    try {
      pathname = new URL(tab.url)?.pathname;
    } catch (e) {
      console.error("Invalid URL:", tab.url);
    }
  }
  element.querySelector(".title").textContent = title;
  element.querySelector(".pathname").textContent = pathname;
  element.querySelector("a").addEventListener("click", async () => {
    // need to focus window as well as the active tab
    await chrome.tabs.update(tab.id, { active: true });
    await chrome.windows.update(tab.windowId, { focused: true });
  });
  elements.add(element);
}
document.querySelector("ul").append(...elements);

const button = document.getElementById("Group");
button.addEventListener("click", async () => {

  const tabIds = tabs.map(({ id }) => id);
  if (tabIds.length) {
    let colors = ["grey","blue","red","yellow","green","pink","purple","cyan","orange"]
    const randomColor = Math.floor(Math.random()*colors.length)
    let color = colors[randomColor]
    tabIds.map(async ({id})=>{
      await chrome.tabs.group({ tabIds });
    })
    const group = await chrome.tabs.group({ tabIds });
    await chrome.tabGroups.update(group, { title: "DOCS",color });
  }
});


const unGroupbtn = document.getElementById("UnGroup")

unGroupbtn.addEventListener("click",async ()=>{
  const tabIds = tabs.map(({id})=>id)
  if(tabIds.length){
    for (const tabId of tabIds) {
      await chrome.tabs.ungroup(tabId);
    }
  }
})
const groupbydomainbtn = document.getElementById("groupbydomain")
groupbydomainbtn.addEventListener("click", async () => {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const domains = new Set();
  for (const tab of tabs) {
    if (typeof tab.url === 'string') {
      try {
        const domain = new URL(tab.url).hostname;
        domains.add(domain);
      } catch (error) {
        console.error(`Invalid URL: ${tab.url}`);
      }
    }
  }
  for (const domain of domains) {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const tabIds = tabs.filter(tab => {
      if (typeof tab.url === 'string') {
        try {
          return new URL(tab.url).hostname === domain;
        } catch (error) {
          console.error(`Invalid URL: ${tab.url}`);
          return false;
        }
      }
      return false;
    }).map(({ id }) => id);
    const group = await chrome.tabs.group({ tabIds });
    await chrome.tabGroups.update(group, { title: domain });
  }
});

