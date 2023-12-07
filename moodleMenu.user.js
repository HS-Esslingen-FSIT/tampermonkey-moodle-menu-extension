// ==UserScript==
// @name         Moodle-menu Extension
// @namespace    http://tampermonkey.net/
// @match        https://moodle.hs-esslingen.de/moodle/*
// @version      1.0.2
// @description  Extension to add a course menu on the left side of each page for HS-Esslingen's moodle.
// @author       HSE-Codes && Heinrian
// @icon         https://moodle.hs-esslingen.de/moodle/theme/image.php/boost/theme/1676389471/favicon
// @require      https://raw.githubusercontent.com/SortableJS/Sortable/1.15.0/Sortable.min.js
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
        divCourseMenuHead.style.backgroundColor = "#193058"

        let h1CourseMenuHeadContent = document.createElement("a")
        h1CourseMenuHeadContent.textContent = "Meine Kurse"
        h1CourseMenuHeadContent.style.fontWeight = "bold"
        h1CourseMenuHeadContent.style.color = "white"
        h1CourseMenuHeadContent.style.fontSize = "2em"

        divCourseMenuHead.appendChild(h1CourseMenuHeadContent)
        divCourseMenu.appendChild(divCourseMenuHead)

        let divCourseMenuList = document.createElement("div")
        divCourseMenuList.style.overflow = "auto"
        divCourseMenuList.style.backgroundColor = "white"
        divCourseMenuList.setAttribute("id", "simpleList");
        divCourseMenuList.classList.add("list-group");
        divCourseMenu.appendChild(divCourseMenuList)

        function appendCourses(jsonCourses) {
            for (const cours of jsonCourses) {
                let divCourse = document.createElement("div")
                divCourse.style.width = "100%"
                divCourse.style.padding = "10px 0"
                divCourse.style.borderBottom = "1px solid lightgrey"
                divCourse.classList.add("list-group-item");
                divCourse.setAttribute("data-id", cours.id);
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

                divCourseMenuList.appendChild(divCourse)
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
            onload: function (response) {
                let json = JSON.parse(response.responseText)[0];
                let jsonCourses = json.data.courses;

                if (json.error === false) {
                    if (localStorage.getItem("sorted-Ids")) {
                        var customOrderedCoursestmp = localStorage.getItem("sorted-Ids");
                        const customOrderedCourses = customOrderedCoursestmp.split("|");
                        // Reorder courses loaded from moodle based on the order in localStorage
                        jsonCourses.sort((a, b) => customOrderedCourses.indexOf(a.id.toString()) - customOrderedCourses.indexOf(b.id.toString()));
                    }
                    appendCourses(jsonCourses);
                }
            },
        };
        //TODO; Store in localstorage as Cache
        GM_xmlhttpRequest(requestDetails);

        return divCourseMenu
    }

    function init() {
        console.log("Load Moodle Extension app")

        let divPage = document.getElementById("page");
        let divPageWrapper = document.getElementById("page-wrapper");
        let divPageMenuContent = document.getElementById("theme_boost-drawers-courseindex");
        let divPageOverlay = document.getElementById("format_tiles_overlay");
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

        var el = document.getElementById("simpleList");
        var sortable = Sortable.create(el, {
            group: "sorted-Ids",
            store: {
                /**
                 * Get the order of elements. Called once during initialization.
                 * @param   {Sortable}  sortable
                 * @returns {Array}
                 */
                get: function (sortable) {
                    var order = localStorage.getItem(sortable.options.group.name);
                    return order ? order.split("|") : [];
                },

                /**
                 * Save the order of elements. Called onEnd (when the item is dropped).
                 * @param {Sortable}  sortable
                 */
                set: function (sortable) {
                    var order = sortable.toArray();
                    localStorage.setItem(sortable.options.group.name, order.join("|"));
                },
            },
        });
        
        divPageOverlay.style.left = "12%"
    }

    init();
})();
