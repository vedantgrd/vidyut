import{D as s,F as e,G as t}from"./index-DpQGEyCZ.js";/**
 * @license lucide-react v1.22.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const c=[["path",{d:"M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z",key:"oz39mx"}],["path",{d:"m9 10 2 2 4-4",key:"1gnqz4"}]],m=s("bookmark-check",c);/**
 * @license lucide-react v1.22.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const n=[["path",{d:"M12 7v6",key:"lw1j43"}],["path",{d:"M15 10H9",key:"o6yqo3"}],["path",{d:"M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z",key:"oz39mx"}]],h=s("bookmark-plus",n),g={async searchScholarships(a){const o={};return a.searchQuery&&(o.search=a.searchQuery),a.minAmount&&(o.minAmount=a.minAmount),a.maxAmount&&(o.maxAmount=a.maxAmount),a.category&&(o.category=a.category),a.educationLevel&&(o.educationLevel=a.educationLevel),a.state&&(o.state=a.state),a.sortBy&&(o.sortBy=a.sortBy),a.page&&(o.page=a.page),a.limit&&(o.limit=a.limit),a.tags&&a.tags.length>0&&(o.tags=a.tags.join(",")),e.get(t.DISCOVERY.SEARCH,{params:o})},async getScholarshipDetails(a){return(await e.get(t.DISCOVERY.DETAILS(a))).scholarship},async toggleSave(a){return(await e.post(t.DISCOVERY.TOGGLE_SAVE(a))).bookmarked},async getFeatured(){return(await e.get(t.DISCOVERY.FEATURED)).scholarships},async getRecommended(){return(await e.get(t.DISCOVERY.RECOMMENDED)).scholarships},async getBookmarked(){return(await e.get(t.DISCOVERY.BOOKMARKED)).scholarships}};export{m as B,h as a,g as d};
