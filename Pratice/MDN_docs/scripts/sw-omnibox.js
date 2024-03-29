console.log("Hello");

chrome.runtime.onInstalled.addListener(async ({reason})=>{
    if(reason ==='install'){
     chrome.storage.local.set({
            apiSuggestions: ['tabs', 'storage', 'scripting']
        })
    }
})
const URL_CHROME_EXTENSIONS_DOC = 'https://developer.mozilla.org/en-US/';

const NUMBER_OF_PREVIOUS_SEARCHES = 4;


chrome.omnibox.onInputChanged.addListener(async (e,suggest)=>{
    await chrome.omnibox.setDefaultSuggestion({
        description:'Enter a Keyword to search in the MDN'
    })
    const {apiSuggestions} = await chrome.storage.local.get();
    const suggestions = apiSuggestions?.map((api)=>{
        return {content:api,description:`Open Documantation ${api}`}
    })
    suggest(suggestions)
})

chrome.omnibox.onInputEntered.addListener((input)=>{
    chrome.tabs.create({url:`${URL_CHROME_EXTENSIONS_DOC}search?q=${input}`});
    updateHistory(input)
})

async function updateHistory(inp){
    let {apiSuggestions} = await chrome.storage.local.get('apiSuggestions');
    apiSuggestions.unshift(inp);
    apiSuggestions.splice(NUMBER_OF_PREVIOUS_SEARCHES);
    return chrome.storage.local.set({ apiSuggestions });

}