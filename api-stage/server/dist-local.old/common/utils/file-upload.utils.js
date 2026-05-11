"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get editFileName () {
        return editFileName;
    },
    get imageFileFilter () {
        return imageFileFilter;
    }
});
const _common = require("@nestjs/common");
const _path = require("path");
const imageFileFilter = (req, file, callback)=>{
    console.log('DEBUG: imageFileFilter - Incoming file:', {
        originalname: file.originalname,
        mimetype: file.mimetype
    });
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        console.log('DEBUG: imageFileFilter - REJECTED (Extension mismatch)');
        return callback(new _common.BadRequestException('Sadece resim dosyaları (jpg, jpeg, png, gif) yüklenebilir!'), false);
    }
    console.log('DEBUG: imageFileFilter - ACCEPTED');
    callback(null, true);
};
const editFileName = (req, file, callback)=>{
    console.log('DEBUG: editFileName - Processing:', file.originalname);
    // Dosya adını ve uzantısını ayır
    const fileExtName = (0, _path.extname)(file.originalname);
    let name = file.originalname.split('.').slice(0, -1).join('.');
    // Mojibake kontrolü ve düzeltme (UTF-8 bytes encoded as Latin-1)
    if (name.includes('Ä')) {
        try {
            const buf = Buffer.from(name, 'binary');
            const corrected = buf.toString('utf8');
            if (corrected !== name) {
                console.log('DEBUG: editFileName - Corrected mojibake:', name, '->', corrected);
                name = corrected;
            }
        } catch (e) {
            console.warn('DEBUG: editFileName - Mojibake correction failed:', e.message);
        }
    }
    // Küçük harfe çevir
    name = name.toLowerCase();
    // Türkçe karakterleri ve özel karakterleri temizle
    const trMap = {
        'ç': 'c',
        'ğ': 'g',
        'ı': 'i',
        'ö': 'o',
        'ş': 's',
        'ü': 'u',
        'İ': 'i',
        'Ğ': 'g',
        'Ü': 'u',
        'Ş': 's',
        'Ö': 'o',
        'Ç': 'c',
        ' ': '_',
        '-': '_',
        '.': '_'
    };
    // Slugification logic: Unicode normalize and then replace
    name = name.replace(/[çğıöşüÇĞİÖŞÜ\s\-\.]/g, (match)=>trMap[match] || '_');
    name = name.replace(/[^a-z0-9_]/g, ''); // Sadece güvenli karakterleri tut
    name = name.replace(/_+/g, '_'); // Çift alt çizgileri temizle
    name = name.replace(/^_|_$/g, ''); // Baştaki ve sondaki alt çizgileri temizle
    // Eğer isim tamamen temizlendiyse varsayılan bir isim ver
    if (!name) {
        name = 'upload';
    }
    const randomName = Array(4).fill(null).map(()=>Math.round(Math.random() * 16).toString(16)).join('');
    const finalName = `${name}-${randomName}${fileExtName}`;
    console.log('DEBUG: editFileName - Final name:', finalName);
    callback(null, finalName);
};

//# sourceMappingURL=file-upload.utils.js.map