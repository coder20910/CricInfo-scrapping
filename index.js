let request = require("request");
let cheerio = require("cheerio");
let path = require("path");
let fs = require("fs");
const { basename } = require("path");


let url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595";
request(url, cb);

function createDir(src){
    if(fs.existsSync(src) == false){
        fs.mkdirSync(src);
    }
}
function createFile(src){
    if(fs.existsSync(src) == false){
        fs.openSync(src, "w");
    }
}

function cb(error, response, html){
    if(error){
        console.log(error);
    }
    else{
        let slTool = cheerio.load(html);
        let allResults = slTool(".widget-items.cta-link a");
        let allResultsLink = "https://www.espncricinfo.com"+slTool(allResults).attr("href");
        loadAllteams(allResultsLink);
    }
}

function loadAllteams(url){
    request(url, cb1);
}
function cb1(error, response, html){
    if(error){
        console.log(error);
    }
    else{
        let teamTool = cheerio.load(html);
        let allMatches = teamTool(".col-md-8.col-16");
        // console.
        for(let i=0; i<allMatches.length; i++){
            let match_i = teamTool(allMatches[i]).find(".btn.btn-sm.btn-outline-dark.match-cta");
            let scorecard_link = "https://www.espncricinfo.com"+teamTool(match_i[2]).attr("href");
            
            Score(scorecard_link);
        }
    }
}

function Score(url){
    request(url, cb2);
}
function cb2(error, response, html){
    if (error){
        console.log(error);
    }
    else{
        let scoreTool = cheerio.load(html);
        let team_name_arr = scoreTool(".name-link");
        
        let teams = [];
        teams.push(scoreTool(team_name_arr[0]).text());
        teams.push(scoreTool(team_name_arr[1]).text());
        
        let dirName1 = path.join(__dirname, teams[0]);
        let dirName2 = path.join(__dirname, teams[1]);
        
        dirNames = [];
        dirNames.push(dirName1);
        dirNames.push(dirName2);

        createDir(dirName1);
        createDir(dirName2);
        
        let batsmentable = scoreTool(".table.batsman");

        for(let i = 0; i < batsmentable.length; i++){
            let allBatsmen = scoreTool(batsmentable[i]).find("tr");
            
            
            for(let k =0; k<allBatsmen.length; k++){
                let batsman_i = scoreTool(allBatsmen[i]).find("td");

                // let batsmanarr =  [];
                if (batsman_i.length == 8){
                    let batsman_name  = scoreTool(batsman_i[0]).text().trim();
                    if (batsman_name[batsman_name.length-1] == "†"){
                        batsman_name = batsman_name.substring(0, batsman_name.length - 1);
                    }
                    
                    let batsman_i_path = path.join(dirNames[i],batsman_name+".json"); 
                    createFile(batsman_i_path);
                    
                    let batsman_obj = {
                        Run: scoreTool(batsman_i[2]).text(),
                        Ball: scoreTool(batsman_i[3]).text(),
                        Four_s: scoreTool(batsman_i[4]).text(),
                        Sixes: scoreTool(batsman_i[5]).text(),
                        SR: scoreTool(batsman_i[6]).text()
                    }
                    fs.appendFileSync(batsman_i_path,JSON.stringify(batsman_obj));
                }
                
            }
        }

    }
}