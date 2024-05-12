
export const getFiles = async () => {
    // Загрузка длин волн
    // const response_nm = await fetch('./Static/nm.json')
    
    const response = await fetch('Static/nm.json', {
        headers:{
            accept: 'application/json',
            'User-agent': 'learning app',
        }
    });
    const nm = await response.json()
    
    // Загрузка текста описания разделов
    // const response_text = await fetch('./static/text.json')
    // const text = await response_text.json()
    console.log(nm)
    return {nm}
}