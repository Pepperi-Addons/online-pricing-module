import Cryptr from 'cryptr'
export function encryptPassword(password: string, key: string) {
    const cryptr = new Cryptr(key);
    const encryptedpassword = cryptr.encrypt(password);
    return encryptedpassword;

}
export function decryptPassword(encryptedString: string, key: string) {
    const cryptr = new Cryptr(key);
    const decryptedpassword = cryptr.decrypt(encryptedString);
    return decryptedpassword;
}
