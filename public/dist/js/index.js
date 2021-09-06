// const btnConect = document.querySelector("#conectarAccount");

const metamaskBtn = document.getElementById('btnConect');

metamaskBtn.addEventListener('click', async() => {
    if(typeof window.ethereum !== 'undefined'){   
        metamaskBtn.classList.add('d-none');
        const accounts = await ethereum.request({ method: 'eth_requestAccounts'});
        account = accounts[0]

        inicioAddress =  account.substr(0, 3);
        finAddress = account.substr(39, 3);
       
        const infoCuenta = document.getElementById('infoCuenta');
        infoCuenta.classList.remove('d-none');
        infoCuenta.innerHTML =  inicioAddress + "..." + finAddress;
    }
});





