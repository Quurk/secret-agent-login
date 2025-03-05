export const updateElementsVisibility = (isConnected) => {
    const connectedOnlyElements = document.querySelectorAll('[data-connected-only]')
    connectedOnlyElements.forEach(button => {
        if (isConnected) button.style.display = ''
        else button.style.display = 'none'
    })

    const disconnectedOnlyElements = document.querySelectorAll('[data-disconnected-only]')
    disconnectedOnlyElements.forEach(button=>{
        if(isConnected) button.style.display = 'none'
        else button.style.display = ''
    })
}