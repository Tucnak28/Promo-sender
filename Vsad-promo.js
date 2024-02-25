// ==UserScript==
// @name         Vsad a Hrej Bonus sender
// @namespace    http://tampermonkey.net/
// @version      2024-02-24
// @description  let's you send promo codes and tell if they are right or wrong
// @author       You
// @match        https://www.vsadahrej.cz/bonuses
// @icon         https://www.google.com/s2/favicons?sz=64&domain=vsadahrej.cz
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const max = 3000;
    const min = 1800;
    var textInterval = Math.random() * (max - min) + min;

    // Function to get current time in a formatted string
    function getCurrentTime() {
        var now = new Date();
        return now.toLocaleString();
    }

    // Function to log messages to a file
    async function logToDump(message) {
        var logMessage = getCurrentTime() + ' - ' + message + '\n';
        console.log(message);
    }


    // Intercept XMLHttpRequest.prototype.open to log sent packets
    var originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
        //logToDump('Packet sent - Method: ' + method + ', URL: ' + url);
        return originalOpen.apply(this, arguments);
    };

    // Intercept XMLHttpRequest.prototype.send to log response
    var originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function() {
        var self = this;
        this.addEventListener('load', function() {
            try {
                var response = JSON.parse(self.responseText);
                if (response && response.errors && response.errors.length > 0) {
                    var errorMessage = response.errors[0].errorMessage;
                    logToDump('Error Message: ' + errorMessage);
                    if (errorMessage === "Promo Code not exists") {
                        // Blink red
                        blinkColor('red', 100);
                    } else {
                        // Blink green
                        blinkColor('green', 100000000);
                        for(var i = 0; i < 10; i++) {
                            logToDump("bingo");
                        }
                    }
                }
            } catch (error) {
                logToDump('Error parsing response: ' + error);
            }
        });
        return originalSend.apply(this, arguments);
    };

    // Function to blink color
    function blinkColor(color, time) {
        var originalColor = document.body.style.backgroundColor;
        document.body.style.backgroundColor = color;
        setTimeout(function() {
            document.body.style.backgroundColor = originalColor;
        }, time);
    }

    // Function to create input box with submit button
    function createInputBox() {
        var inputBox = document.createElement('input');
        inputBox.setAttribute('type', 'text');
        inputBox.setAttribute('id', 'inputText');
        var submitButton = document.createElement('button');
        submitButton.innerText = 'Submit';
        submitButton.addEventListener('click', function() {
            var inputValue = document.getElementById('inputText').value;
            var inputArray = inputValue.split(',').map(item => item.trim());
            sendTexts(inputArray);
        });
        document.body.appendChild(inputBox);
        document.body.appendChild(submitButton);
    }

    // Function to send texts with a set interval
    function sendTexts(texts) {
        var index = 0;
        var interval = setInterval(function() {
            if (index < texts.length) {
                var text = texts[index];
                if (text !== '') {
                    logToDump(text);
                    // Send the text in a packet
                    var xhr = new XMLHttpRequest();
                    xhr.open('POST', 'https://modplay.cbcap.cz/capi/v2-onling/Bonuses/UseCode?code=' + encodeURIComponent(text) + '&playerId=2000221321');
                    xhr.setRequestHeader('Content-Type', 'application/json');
                    xhr.setRequestHeader('Authorization', 'Bearer eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IkFwcGxpY2F0aW9uUGxheWVyIiwiY2FwaV9wbGF0Zm9ybSI6Ik9ubGluZSIsImNhcGlfc2NvcGUiOiJTbG90cyIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MDg5NjIyNzksImlhdCI6MTcwODc4OTQ3OSwibmJmIjoxNzA4Nzg5NDc5LCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjIwMDAyMjEzMjEiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJBcHBsaWNhdGlvblBsYXllciIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL3NpZCI6IjU4YzBjNGI2LWVmOWEtNGFhZi1iMjYxLTVjZWY2OTMwODQ4MyJ9.NIqYSSCfp4-NPAZ7igWOCco46GCSZMFzyCmP1UUnpf4');
                    xhr.send();
                }
                index++;
            } else {
                clearInterval(interval); // Stop the interval when all texts are sent
            }
        }, textInterval); // 1 second interval between sending texts
    }

    // Call the function to create input box
    createInputBox();
})();

