const key = "shell:style"

window.addEventListener('storage', function(e) {
    if(e.key === key) {
        toggleDarkMode();
    }
});

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    toggleDarkMode();
});

const toggleDarkMode = () => {
    element = document.getElementById("html")
    if (localStorage.getItem(key)){
        if (localStorage.getItem(key) === "dark"){
            element.classList.add("pf-v5-theme-dark")
        }
        else if (localStorage.getItem(key) === "light"){
            element.classList.remove("pf-v5-theme-dark")
        }
        else{
            if(window.matchMedia('(prefers-color-scheme: dark)').matches){
                element.classList.add("pf-v5-theme-dark")
            }
            else{
                element.classList.remove("pf-v5-theme-dark")
            }
        }
    }
    else {
        if(window.matchMedia('(prefers-color-scheme: dark)').matches){
            element.classList.add("pf-v5-theme-dark")
        }
        else{
            element.classList.remove("pf-v5-theme-dark")
        }
    }
}

toggleDarkMode();