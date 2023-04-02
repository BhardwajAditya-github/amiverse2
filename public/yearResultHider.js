function yearFilterShow(){
    var yearFilter = document.getElementById("filterResult");
    if(yearFilter != null){
    const classList = document.getElementsByClassName("searchRenderer-content-paper");
    const classLength = classList.length;
    if (classLength != 0) {
        yearFilter.style.display = "block";
    }
    else{
        yearFilter.style.display = "none";
    }
}
}