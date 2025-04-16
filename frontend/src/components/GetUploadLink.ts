function GetUploadLink(image_path: string): string {
    return process.env.REACT_APP_API_BASE + "/upload/" + image_path;
}

export default GetUploadLink;