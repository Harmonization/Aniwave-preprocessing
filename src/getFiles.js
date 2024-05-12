
export const getFiles = async () => {
    // Загрузка длин волн
    const response_nm = await fetch('./Static/nm.json')
    const nm = await response_nm.json()

    // Загрузка текста описания разделов
    // const response_text = await fetch('./static/text.json')
    // const text = await response_text.json()

    return {nm}
}