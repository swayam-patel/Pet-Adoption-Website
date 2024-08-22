updateTime()
function updateTime() {
    var time = (new Date()).toLocaleString({
      hour12: true,
    });
    
    document.getElementById('current_time_item').innerHTML = time;
    requestAnimationFrame(updateTime);
};