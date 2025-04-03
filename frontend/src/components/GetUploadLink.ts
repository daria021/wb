function GetUploadLink(image_path: string): string {
    let url = `${process.env.REACT_APP_API_BASE}upload/${image_path}`;
    console.log(url);
    console.log(process.env.REACT_APP_API_URL);
    console.log(image_path);
    return url;
}

export default GetUploadLink;