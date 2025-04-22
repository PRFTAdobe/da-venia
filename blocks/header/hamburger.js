const tokenMobExists = localStorage.getItem("user_token") !== null;
let userDataMobile = {};
let userNameMobile = '';
if(tokenMobExists){
  userDataMobile = JSON.parse(localStorage.getItem("user_data"));
  userNameMobile = userDataMobile?.email.split('@')[0];
}

export function toggleMenu() {
    const cDisplay = document.querySelector('.main-navigation-drawer');
    const nDisplay = cDisplay.style.display === 'none' ? 'block' : 'none';
    const menuIcon = document.querySelector('.nav-hamburger button');
    const navWrapper = document.querySelector('.nav-wrapper');
    document.querySelector('.main-navigation-drawer').style.display = nDisplay;
  
    if (nDisplay === 'none') {
      menuIcon.classList.remove('open');
      navWrapper.classList.remove('fixed');
    } else {
      menuIcon.classList.add('open');
      navWrapper.classList.add('fixed');
    }
  }
  
  export function hamburgerIcon() {
    return `
      <button type="button" aria-controls="nav" aria-label="Open navigation">
        <span class="nav-hamburger-icon"></span>
      </button>
      <span class="menu-hamb">Menu</span>
      `;
  }
  
  export function hamburgerMenuMarkup(userIcon, userText) {
    let navSections = document.querySelectorAll(".nav-sections ul");
    return `
      <div class="navigation-wrapper">
        <div class="sign-in-info-mobile">
          <div class ="sign-in-wrapper">
            <div class="title-return">
              <svg class="return" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-icon-_rq"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              <h5>Sign-In To Your Account</h5>
            </div>
            <form class="sign-in-information">
              <small>The account sign-in was incorrect or your account is disabled temporarily. Please wait and try again later.</small>
              <div class="full-width-input email">
                <label>Email address</label>
                <input type="email" placeholder="" id="mobile-email"/>
                <small>Error Message</small>
              </div>
              <div class="full-width-input psw">
                <label>Password</label>
                <input type="password" placeholder="" id="mobile-password"/>
                <small>Error Message</small>
              </div>
            </form>
            <div class="logged-user">
              <span></span>
            </div>
            <span class="forgot-psw">Forgot Password?</span>
            <div class="sign-in-buttons">
              <button type="submit" id="mobile-sign-in-btn">Sign In</button>
              <button type="submit" id="mobile-create-account">Create an account</button>
            </div>
          </div>
        </div>
        <ul class="main-navigation-utility-menu">`+ 
        navSections[0].innerHTML + `</ul>` 
        + `<div class="user">` + 
        userIcon.outerHTML +
        `<span class="account-user">${tokenMobExists ? userNameMobile : 'Account'}</span>`+
        `${tokenMobExists ? '<span class="text-user" style="display:none">Sign In</span>' : userText.outerHTML}` + 
        `<span id=log-out-mobile class="${tokenMobExists ? 'show' : ''}">Log Out</span>
        </div>`+
      `</div>`;
  }