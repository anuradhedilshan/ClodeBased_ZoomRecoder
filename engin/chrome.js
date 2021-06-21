const puppeteer = require('puppeteer');
const Event_ = require('./Event_');
const uniqid = require('uniqid');

class chrome extends Event_ {

    static pages = {};
    browser = null;
    static processId = null;
    processId = null;




    async launchChrome(options = { executablePath: '/usr/bin/google-chrome',headless:true,defaultViewport: null, args: ["--window-size=1280,720",'--start-maximized', '--single-process', '--autoplay-policy=no-user-gesture-required'], ignoreDefaultArgs: ["--mute-audio"] }) {
        // ,
        // options = { executablePath: '/usr/bin/google-chrome', headless: false }
        try {
            this.browser = await puppeteer.launch(options);
            chrome.processId = this.processId = this.browser.process().pid;
            console.log(chrome.processId);
            return this.browser.wsEndpoint();
        } catch (error) {
            this.chromelauncherror(error)
            console.log("ERRRO AT CHROME")
        }

    }


    // Create New Tab 
    async new_page(url) {
        var len = Object.keys(chrome.pages).length;
        if (this.browser != null) {
            if (len < this.max) {
                let id = uniqid.time();
                console.log(id);
                chrome.pages[id] = await this.browser.newPage();

                await chrome.pages[id].goto(url, { waitUntil: 'load', timeout: 0 });
                return id;
            } else {
                this.cantOpenNewPage(`Limited Resourcec - Opend pages ${len}`,)
            }
        } else {
            this.cantOpenNewPage("Broweser Got Null  Value");

        }

    }

    static get_page(id) {

        return chrome.pages[id];
    }
    static get_pages() {
        return chrome.pages;
    }
    static async close_page(id) {
        if (id in chrome.pages) {
            await chrome.pages[id].close();
            delete chrome.pages[id]
        } else {
            throw new Error("this id  not conatin any page")
        }
        return id;
    }

    async close_browser() {
        if (this.browser != null) {
            await this.browser.close();
            this.browser = null;
            chrome.pages = null;
        }

    }
    // closing All of the Started Tabs
    static async distroy_all() {
        console.log("Closing")
        for (let i = 0; i < Object.keys(chrome.pages).length; i++) {
            await chrome.pages[Object.keys(chrome.pages)[i]].close();
        }
    }

}







module.exports = chrome;





