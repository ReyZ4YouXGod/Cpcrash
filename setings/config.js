const config = {
    // API Pterodactyl (Application API)
    domain: "https://kurodev.apcb.biz.id", 
    apikey: "ptla_X6SsMJgB3hxBU7hsdxuOjIL5wlUXbcXxpwW6dE6pMGO",
    nestid: "5",
    egg: "15",
    loc: "1",

    // Resource Map (Setting RAM, Disk, CPU)
    resourceMap: {
        "1gb": { ram: "1000", disk: "1000", cpu: "40" },
        "2gb": { ram: "2000", disk: "1000", cpu: "60" },
        "3gb": { ram: "3000", disk: "2000", cpu: "80" },
        "4gb": { ram: "4000", disk: "2000", cpu: "100" },
        "5gb": { ram: "5000", disk: "3000", cpu: "120" },
        "6gb": { ram: "6000", disk: "3000", cpu: "140" },
        "7gb": { ram: "7000", disk: "4000", cpu: "160" },
        "8gb": { ram: "8000", disk: "4000", cpu: "180" },
        "9gb": { ram: "9000", disk: "5000", cpu: "200" },
        "10gb": { ram: "10000", disk: "5000", cpu: "220" },
        "unlimited": { ram: "0", disk: "0", cpu: "0" }
    },

    // Cloudflare Subdomain Settings
    subdomain: {
      "galanghostxoline.my.id": {
        "zone": "6ac7dc4e93652bfa6bb1c79d2d2d49e7",
        "apitoken": "M64KlwR_p7wxc15UkzD0x9k1VgdR7O86ADThGt54"
      },
      "galangoffc.biz.id": {
        "zone": "de6ecce0e30520f02a55ef47c132aee6", 
        "apitoken": "SgsTW6PzCAbeKN38TWPald2NmwO_TgvxkwDHMOyw"
      }, 
      "pteroweb.my.id": {
        "zone": "714e0f2e54a90875426f8a6819f782d0",
        "apitoken": "vOn3NN5HJPut8laSwCjzY-gBO0cxeEdgSLH9WBEH"
      },
      "panelwebsite.biz.id": {
        "zone": "2d6aab40136299392d66eed44a7b1122",
        "apitoken": "CcavVSmQ6ZcGSrTnOos-oXnawq4yf86TUhmQW29S"
      },
      "privatserver.my.id": {
        "zone": "699bb9eb65046a886399c91daacb1968",
        "apitoken": "CcavVSmQ6ZcGSrTnOos-oXnawq4yf86TUhmQW29S"  
      }
    }
};
