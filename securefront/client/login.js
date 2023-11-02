function login() {
  let myemail = document.getElementById("email").value;
  let mypassword = document.getElementById("password").value;
  console.log(mypassword);
  console.log(myemail);

  axios
    .post("http://localhost:5000/user/login", {
      email: myemail,
      password: mypassword
    })

    .then(
      (response) => {
        //response.redirect('/blog')
        console.log("login succesfullt",response.data);

        var token = response.headers.authorization;

        window.sessionStorage.token = response.headers.authorization;

        window.sessionStorage.email = myemail;

        window.location.href = "/blog";

        //window.location.href="/blog"

        // console.log(response);
      },
      (error) => {
        console.log(error);
      }
    );
}
