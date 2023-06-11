// Função para redimensionar uma imagem
function redimensionarImagem(url, largura, altura) {
  return new Promise(function (resolve, reject) {
    var imagem = new Image();

    imagem.crossOrigin = "Anonymous"; // Permite carregar imagens de outros domínios

    imagem.onload = function () {
      var canvas = document.createElement("canvas");
      var context = canvas.getContext("2d");
      canvas.width = largura;
      canvas.height = altura;
      context.drawImage(imagem, 0, 0, largura, altura);

      // Obter a imagem redimensionada como um blob
      canvas.toBlob(function (blob) {
        // Criar um URL temporário para o blob
        var urlRedimensionada = URL.createObjectURL(blob);
        resolve(urlRedimensionada);
      }, "image/jpeg");
    };

    imagem.onerror = function () {
      reject(new Error("Erro ao carregar a imagem."));
    };

    imagem.src = url;
  });
}

// Função para dividir os produtos em linhas
function dividirProdutosEmLinhas(produtos, colunasPorLinha) {
  var linhas = [];
  var linhaAtual = [];

  for (var i = 1; i < produtos.length; i++) {
    linhaAtual.push(produtos[i]);

    if (linhaAtual.length === colunasPorLinha) {
      linhas.push(linhaAtual);
      linhaAtual = [];
    }
  }

  if (linhaAtual.length > 0) {
    linhas.push(linhaAtual);
  }

  return linhas;
}

document.getElementById("submitBtn").onclick = function () {
  var input = document.getElementById("userInput").value;
  var url = "/pesquisa.html" + "?" + "search=" + input;

  changeWindow(url);
};

function searchBar() {
  var input = document.getElementById("userInput").value;
  var url = "/pesquisa.html" + "?" + "search=" + input;
}

function changeWindow(url) {
  window.open(url);
}

//para pegar o id da URL
function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i = 1; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (decodeURIComponent(pair[0]) === variable) {
      return decodeURIComponent(pair[1]);
    }
  }
  return false;
}

function fetchPagesNumber() {
  fetch(
    "https://diwserver.vps.webdock.cloud/products/category/Personal Care - Fragrance"
  )
    .then((response) => response.json())
    .then((products) =>
      getPagesNumber(products.current_page + 1, products.total_pages)
    )
    .catch((error) => {
      console.error("Erro ao obter os produtos da API:", error);
    });
}

function getPagesNumber(currentPage, totalPages) {
  var page = currentPage;
  var pageTotal = totalPages;
  for (var i = currentPage; i <= totalPages; i++) {
    fetchProductsByPage(i);
  }
}

// Função para renderizar os produtos com base na URL fornecida
function renderizarProdutos(url) {
  // Limpar o conteúdo anterior, se houver
  $("#produtos-container").empty();

  // Fazer uma requisição HTTP para a API usando fetch()
  fetch(url)
    .then((response) => {
      // Verificar se a resposta da API é bem-sucedida (status 200)
      if (response.ok) {
        // Converter a resposta em JSON
        return response.json();
      } else {
        throw new Error("Erro ao obter os produtos da API.");
      }
    })
    .then((data) => {
      const produtos = data.products;

      var linhasProdutos = dividirProdutosEmLinhas(produtos, 10);

      // Loop através das linhas de produtos
      linhasProdutos.forEach(function (linhaProdutos) {
        // Criar uma div de linha do Bootstrap para cada linha de produtos
        var divLinha = $("<div>").addClass("row");

        // Loop através dos produtos na linha atual
        linhaProdutos.forEach(function (produto) {
          // Criar uma coluna do Bootstrap para cada produto
          var colunaProduto = $("<div>").addClass("col-md-4");

          // Criar um card do Bootstrap para exibir as informações do produto
          var card = $("<div>").addClass("card mb-3");

          // Criar o corpo do card
          var cardBody = $("<div>").addClass("card-body");

          // Adicionar o nome do produto ao card como um link
          var nomeProduto = $("<h5>")
            .addClass("card-title")
            .addClass("text-truncate")
            .css("width", "150px")
            .css("height", "18px")
            .html(
              `<a href="detalhes.html?id=${produto.id}">${produto.title}</a>`
            );
          cardBody.append(nomeProduto);

          // Adicionar a imagem do produto ao card
          var imagemProduto = $("<img>")
            .addClass("card-img-top")
            .attr("alt", produto.title)
            .css("width", "250px")
            .css("height", "250px")
            .css("object-fit", "cover");

          // Obter a imagem redimensionada e atribuir o src após o redimensionamento
          redimensionarImagem(produto.image, 200, 200)
            .then(function (imagemRedimensionada) {
              imagemProduto.attr("src", imagemRedimensionada);
            })
            .catch(function (error) {
              console.error("Erro ao redimensionar a imagem:", error);
            });

          card.append(imagemProduto);

          // Adicionar o preço do produto ao card
          var precoProduto = $("<p>")
            .addClass("card-text")
            .text("Preço: R$ " + produto.price.toFixed(2));
          cardBody.append(precoProduto);

          // Adicionar comprar
          var botaoCompra = $("<button>")
            .addClass("btn btn-primary btn-compra")
            .text("ir");

          // Adicionar o manipulador de eventos ao botão de compra
          botaoCompra.on("click", function () {
            // Ação a ser executada quando o botão de compra for clicado
            console.log(
              "Botão de compra clicado para o produto: " + produto.title
            );
          });

          // Adicionar o botão de compra ao card
          cardBody.append(botaoCompra);

          // Adicionar o card ao corpo da coluna
          colunaProduto.append(card.append(cardBody));

          // Adicionar a coluna à linha
          divLinha.append(colunaProduto);
        });

        // Adicionar a linha de produtos ao container de produtos
        $("#produtos-container").append(divLinha);
      });
    })
    .catch((error) => {
      console.error("Erro ao obter os produtos da API:", error);
    });
}

// Chamar a função para renderizar os produtos quando a página carregar
$(document).ready(function () {
  renderizarProdutos(
    "https://diwserver.vps.webdock.cloud/products/category/Personal Care - Fragrance"
  );
});

// Função para renderizar os produtos filtrados com base nos filtros selecionados
function renderizarProdutosFiltrados() {
  // Obter os valores selecionados dos filtros
  var brand = document.getElementById("brandsCategory").value;
  var usage = document.getElementById("usageCategory").value;
  var gender = document.getElementById("genderCategory").value;

  // Construir a URL da API com os filtros selecionados
  var apiUrl = `https://diwserver.vps.webdock.cloud/products/category/Personal%20Care%20-%20Fragrance?brand=${brand}&usage=${usage}&gender=${gender}`;

  // Fazer uma chamada GET para a API de produtos com base nos filtros selecionados
  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      // Verificar se a resposta da API contém dados
      if (data && data.products && Array.isArray(data.products)) {
        var products = data.products;

        // Limpar o conteúdo anterior, se houver
        $("#produtos-container").empty();

        // Loop através dos produtos retornados da API
        products.forEach((produto) => {
          // Criar um card para exibir as informações do produto
          var card = $("<div>").addClass("card mb-3");

          // Criar o corpo do card
          var cardBody = $("<div>").addClass("card-body");

          // Adicionar o nome do produto ao card como um link
          var nomeProduto = $("<h5>")
            .addClass("card-title")
            .addClass("text-truncate")
            .css("width", "150px")
            .css("height", "18px")
            .html(
              `<a href="detalhes.html?id=${produto.id}">${produto.title}</a>`
            );
          cardBody.append(nomeProduto);

          // Adicionar a imagem do produto ao card
          var imagemProduto = $("<img>")
            .addClass("card-img-top")
            .attr("alt", produto.title)
            .css("width", "250px")
            .css("height", "250px")
            .css("object-fit", "cover")
            .attr("src", produto.image);
          card.append(imagemProduto);

          // Adicionar o preço do produto ao card
          var precoProduto = $("<p>")
            .addClass("card-text")
            .text("Preço: R$ " + produto.price.toFixed(2));
          cardBody.append(precoProduto);

          // Adicionar o card ao corpo da coluna
          card.append(cardBody);

          // Adicionar o card ao container de produtos
          $("#produtos-container").append(card);
        });
      } else {
        console.error("Dados inválidos retornados da API:", data);
      }
    })
    .catch((error) => {
      console.error("Erro ao obter os produtos da API:", error);
    });
}

// Esperar até que o DOM esteja completamente carregado
document.addEventListener("DOMContentLoaded", function () {
  // Obter os elementos HTML pelos IDs
  var brandsCategory = document.getElementById("brandsCategory");
  var usageCategory = document.getElementById("usageCategory");
  var genderCategory = document.getElementById("genderCategory");
  var submitBtn = document.getElementById("submitBtn");

  if (submitBtn && brandsCategory && usageCategory && genderCategory) {
    submitBtn.addEventListener("click", function () {
      renderizarProdutosFiltrados();
    });
  } else {
    console.error(
      "Elementos não encontrados. Verifique os IDs dos elementos HTML."
    );
  }
});
