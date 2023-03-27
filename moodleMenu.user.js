// ==UserScript==
// @name         Moodle-menu Extension
// @namespace    http://tampermonkey.net/
// @match        https://moodle.hs-esslingen.de/moodle/*
// @version      1.0.1
// @description  Extension to add a course menu on the left side of each page for HS-Esslingen's moodle.
// @author       HSE-Codes && Heinrian
// @icon         https://moodle.hs-esslingen.de/moodle/theme/image.php/boost/theme/1676389471/favicon
// @grant        GM_log
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    function createCourseMenu() {
        let divCourseMenu = document.createElement("div")
        divCourseMenu.style.backgroundColor = "#f8f9fa"
        divCourseMenu.style.width = "100%"
        divCourseMenu.style.height = "calc(100vh - 60px)"
        divCourseMenu.style.marginTop = "60px"
        divCourseMenu.style.display = "flex"
        divCourseMenu.style.flexDirection = "column"
        divCourseMenu.style.borderRight = "thin solid lightgrey"

        let divCourseMenuHead = document.createElement("div")
        divCourseMenuHead.style.width = "100%"
        divCourseMenuHead.style.textAlign = "center"
        divCourseMenuHead.style.borderBottom = "thin solid lightgrey"

        let h1CourseMenuHeadContent = document.createElement("h1")
        h1CourseMenuHeadContent.textContent = "Meine Kurse"
        h1CourseMenuHeadContent.style.fontWeight = "bold"

        divCourseMenuHead.appendChild(h1CourseMenuHeadContent)
        divCourseMenu.appendChild(divCourseMenuHead)

        function appendCourses(jsonResponse) {

            for (const cours of jsonResponse.data.courses) {
                let divCourse = document.createElement("div")
                divCourse.style.width = "100%"
                divCourse.style.padding = "10px 0"
                divCourse.style.borderBottom = "1px solid lightgrey"
                divCourse.onmouseout = () => {
                    divCourse.style.backgroundColor = "transparent"
                }
                divCourse.onmouseover = () => {
                    divCourse.style.backgroundColor = "lightgrey"
                }


                let divCourseLink = document.createElement("a")
                divCourseLink.href = cours.viewurl
                divCourse.appendChild(divCourseLink)

                let divCourseContent = document.createElement("div")
                divCourseContent.innerHTML = cours.shortname
                divCourseContent.style.padding = "10px 0 10px 30px"

                divCourseLink.appendChild(divCourseContent)

                divCourseMenu.appendChild(divCourse)
            }
        }

        let requestDetails = {
            method: "POST",
            url: "https://moodle.hs-esslingen.de/moodle/lib/ajax/service.php?sesskey="+M.cfg.sesskey+"&info=core_course_get_enrolled_courses_by_timeline_classification",
            data: "[{\"index\":0,\"methodname\":\"core_course_get_enrolled_courses_by_timeline_classification\",\"args\":{\"offset\":0,\"limit\":0,\"classification\":\"inprogress\",\"sort\":\"shortname\",\"customfieldname\":\"\",\"customfieldvalue\":\"\"}}]",
            headers: {
                "Content-Type": "application/json"
            },
            responseType: 'json',
            onload: function(response) {
                let json = JSON.parse(response.responseText)[0]
                console.log(json)
                if (json.error === false) {
                    appendCourses(json)
                }
            }
        }
        //TODO; Store in localstorage as Cache
        GM_xmlhttpRequest(requestDetails);

        return divCourseMenu
    }

    function init() {
        console.log("Load Moodle Extension app")

        let divPage = document.getElementById("page");
        let divPageWrapper = document.getElementById("page-wrapper");
        let divPageMenuContent = document.getElementById("theme_boost-drawers-courseindex");
        if (divPageMenuContent) {
            divPageMenuContent.style.marginLeft = "calc(12% + 2px)"
        }

        divPageWrapper.removeChild(divPage)

        let divFlexRow = document.createElement("div")
        divFlexRow.style.display = "flex"

        let divFlexItemCourseMenu = document.createElement("div")
        divFlexItemCourseMenu.style.flex = "12%"
        divFlexItemCourseMenu.appendChild(createCourseMenu())

        let divFlexItemContent = document.createElement("div")
        divFlexItemContent.style.flex = "88%"
        divFlexItemContent.appendChild(divPage)

        divFlexRow.appendChild(divFlexItemCourseMenu)
        divFlexRow.appendChild(divFlexItemContent)

        divPageWrapper.appendChild(divFlexRow)
    }

    init();
})();
