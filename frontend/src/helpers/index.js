export default {
    URL_API: `http://192.168.25.12:3003`, //roteador quarto
    // URL_API: `http://192.168.0.102:3003`, //roteador sala
    // URL_API: `http://192.168.0.13:3003`, //roteador weskley

    truncate(value, max = 10) {
        let valueTruncate =  value.length <= max ? value.toString() : `${value.substring(max, 0)}...`
        valueTruncate = valueTruncate.replace(/\n/ig, ' ')
        return valueTruncate
    },
}