export const httpService = (() => {
  const httpRequest = (method, url, body) => {
    const request = new XMLHttpRequest();
    return new Promise((resolve, reject) => {
      request.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE) {
          if (this.status === 200) {
            const contentDisposition = this.getResponseHeader('Content-Disposition');
            const fileName = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)[1];
            const type = this.getResponseHeader('Content-Type');
            const blob = new Blob([this.response], { type: type });
            resolve({
              blob,
              fileName,
            });
          } else {
            reject(JSON.parse(this.responseText));
          }
        }
      };
      request.open(method, url, true);
      request.setRequestHeader('Content-Type', 'application/json');
      request.send(body);
    });
  };
  return {
    post: async (url, body) => await httpRequest('POST', url, body),
  };
})();
