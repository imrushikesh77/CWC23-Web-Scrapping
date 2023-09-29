const axios = require('axios');
const cheerio = require('cheerio');

// The URL of the CWC23 web page
const url = 'https://www.cricbuzz.com/cricket-series/6732/icc-cricket-world-cup-2023/matches';

// Function to fetch the web page content
async function fetchWebPage() {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching web page:', error);
  }
}

// Function to convert given time to indian time
function addHoursAndMinutes(time, hours, minutes) {
    const [originalHours, originalMinutes] = time.split(':');
    let newHours = parseInt(originalHours) + hours;
    let newMinutes = parseInt(originalMinutes) + minutes;
  
    if (newMinutes >= 60) {
      newHours += 1;
      newMinutes -= 60;
    }
    
    if(newHours > 12){
        newHours -= 12;
        return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')} PM`;
    }
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')} AM`;
}

// Function to scrape the match details and log them to the console
async function scrapeAndLog() {
    const htmlContent = await fetchWebPage();
    if (!htmlContent) {
      return;
    }
  
    const $ = cheerio.load(htmlContent);
  
    // Select all <div> elements with the specified class and iterate through them
    $('div.cb-col-60.cb-col.cb-srs-mtchs-tm').each((index, element) => {
      // Find the <a> tag inside the current <div> element
      const $a = $(element).find('a.text-hvr-underline');
      
      // Find the stadium name
      const stadiumName = $(element).find('div.text-gray').text().trim();
      
      // Find the text of the <span> tag inside the <a> tag
      const spanText = $a.find('span').text().trim();
      
      // Extract team names from spanText
      const matchRegex = /(.+?)\s+vs\s+(.+?),/;
      const matchResult = matchRegex.exec(spanText);
      
      if (matchResult && matchResult.length === 3) {
        const team1 = matchResult[1].trim();
        const team2 = matchResult[2].trim();
        
        // Find the start time
      const startTimeElement = $(element).find('a.cb-text-upcoming');
      let startTime = startTimeElement.text().trim().replace('Match starts at', '').trim();
      
      // Convert time to indian time
      const timePart = startTime.split(',')[1].trim();
      const newTime = addHoursAndMinutes(timePart, 5, 30);
      startTime = startTime.replace(timePart, newTime);
        
        // Log the "Match X," team names, and the date and time to the console
        console.log(`Match ${index + 1}: ${team1} vs ${team2}`);
        console.log(`Stadium: ${stadiumName}`);
        console.log(`Date & Time: ${startTime}\n`);
      }
    });
  }

// Call the scrapeAndLog function to start the scraping process
scrapeAndLog();
