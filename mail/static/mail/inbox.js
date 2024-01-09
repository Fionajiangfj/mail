document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  //submit the form
  document.querySelector('#compose-form').onsubmit = event => {
    event.preventDefault();

    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;

    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: recipients,
          subject: subject,
          body: body
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);

        //redirect to sent mailbox
        load_mailbox('sent')

    });
  };
  
  // By default, load the inbox
  load_mailbox('inbox');

});



function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}


function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  //show mailboxs
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);

      //create li tags for sent emails
      emails.forEach(email => {
        const element = document.createElement('div');
        element.innerHTML = `
          <p><strong>Sender: ${email.sender}</strong></p>
          <p><strong>Subject: ${email.subject}</strong></p>
          <p>Time: ${email.timestamp}</p>
        `;
        document.querySelector('#emails-view').append(element);

        //hide #email-view, show #emails-view
        document.querySelector('#email-view').style.display = 'none';
        document.querySelector('#emails-view').style.display = 'block';

        //apply CSS to div
        element.className = 'list-group-item';
        if (email.read === true) {
          element.className = 'list-group-item list-group-item-dark';
        }

        //click to see the email content
        element.addEventListener('click', function() {
            console.log('This element has been clicked!');

            fetch(`/emails/${email.id}`)
            .then(response => response.json())
            .then(email_cnt => {

              // Print email
              console.log(email_cnt);

              //create email body
              const header = document.createElement('div');
              const hr = document.createElement('hr');
              const body = document.createElement('div');
              const btn = document.createElement('BUTTON');


              //populate email body
              header.innerHTML = `
                <p><strong>From: </strong>${email_cnt.sender}</p>
                <p><strong>To: </strong>${email_cnt.recipients}</p>
                <p><strong>Subject: </strong>${email_cnt.subject}</p>
                <p><strong>Timestamp: </strong>${email_cnt.timestamp}</p>
              `;
              body.innerHTML = `<p>${email_cnt.body}</p>`

              //hide #emails-view, show #email-view
              document.querySelector('#emails-view').style.display = 'none';
              document.querySelector('#email-view').style.display = 'block';

              //clear the previous #email-view and append the new divs
              document.querySelector('#email-view').innerHTML = '';
              document.querySelector('#email-view').append(header);
              document.querySelector('#email-view').append(hr);
              document.querySelector('#email-view').append(body);
              
              //mark as archived or unarchived
              if (email_cnt.archived === false) {
                console.log('this email is unarchived now!')
                const btnArchive = document.createTextNode("Archive");
                btn.appendChild(btnArchive);
                document.querySelector('#email-view').appendChild(btn);

                //if click archive
                btn.onclick = () => {
                  fetch(`/emails/${email_cnt.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        archived: true
                    })
                  })
                };

              } else {
                const btnUnarchive = document.createTextNode("Archive");
                btn.appendChild(btnUnarchive);
                document.querySelector('#email-view').appendChild(btn);

                //if click unarchive
                btn.onclick = () => {
                  fetch(`/emails/${email_cnt.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        archived: false
                    })
                  })
                };
              }

              //mark the email as read
              fetch(`/emails/${email_cnt.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    read: true
                })
              });
            });
        });      
      }); 
  });

}