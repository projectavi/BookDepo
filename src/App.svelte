<script>
import { parse } from "path";


	let book_name = "";
	let num_results = "";
	let results = [];
	let FLAG_done = "none";

	async function handleSearch(e) {
		// let data = {search: book_name, num: num_results}

		if (!book_name.trim() || !num_results.toString().trim()) {
			alert("One of the fields is empty, please fill it")
		}
		else if (parseInt(num_results) > 10 || parseInt(num_results) < 2) {
			alert("The number you entered is out of the range, please enter a number between 2 and 10")
		}
		else {
			FLAG_done = "searching";
			alert("Now searching for your books, this may take a while (< 1 minute)")
			try {
				const returnValue = await fetch(`/search?term=${JSON.stringify({search: book_name, num: num_results})}`);
				const response = await returnValue.json();
				results = response.data;
				FLAG_done = "found";
				console.log(results)
				alert("Results Found! If there are less than half your desired results please try again, there may have been a server error")
			} catch (error) {
				console.error("error", error);
				alert("An error ocurred, please reload the page and try again")
			}
		}
	}

</script>

<main>
	<link href="https://fonts.googleapis.com/css?family=Open+Sans:300i,400" rel="stylesheet">
	<div class="titles">
		<h2>Book Depo</h2>
	</div>

	<br />
	<br />

	<div class="input-grid">

		<div class="w3-card-4">
		
			<form class="w3-container">
			  <p>
			  <input class="w3-input" type="text" bind:value={book_name}>
			  <label>Book Name</label></p>
			  <p>     
			  <input class="w3-input" type="number" bind:value={num_results} min=2 max=10>
			  <input class="w3-input" type="range" bind:value={num_results} min=2 max=10>
			  <label>Number of Results</label></p>
			</form>
			<link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
		</div>

		<br/>
		{#if FLAG_done === "searching"}
			<button on:click={handleSearch} id="button">Searching...</button>
		{:else}
			<button on:click={handleSearch} id="button">Search!</button>
		{/if}
	</div>

	<br />

	<article class="grid container">
		{#if FLAG_done !== "searching"}
			{#each results as result}
				<div class="result"> <a href={result.link} target="_blank"> <h4> {result.title} </h4> </a> </div>
				
			{/each}
		{/if}
	</article>
</main>

<style>
	
	button {
		background-color: #1C5253; /* Green */
		border: none;
		color: #F7F7FF;
		padding: 15px 32px;
		text-align: center;
		text-decoration: none;
		display: inline-block;
		font-size: 16px;
		transition-duration: 0.4s;
		border-radius: 25px;
		margin-bottom: 15px;
	}

	button:hover {
		background-color: #276566;
		transform: scale(1.15);
	}

	:global(body) {
		background-color: #00A878;
		font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
	}

	.input-grid {
		grid-area: input;
		place-items: center;
	}

	.grid {
		display: grid;
		place-items: center;
		grid-area: results;
	}

	a {
		text-decoration: none;
	}

	.result {
		background-color: #00A878;
		border-radius: 80px;
		border: 5px black;
		box-shadow: rgba(25,25,25,.04) 0 0 2px 0,rgba(0,0,0,.1) 0 6px 8px 0;
		color: #1C5253;
		cursor: pointer;
		display: inline-block;
		font-family: Arial,sans-serif;
		font-size: 0.75em;
		/* height: 50px; */
		width:fit-content;
        height:fit-content;
		padding: 0 25px;
		transition: all 200ms;
		transition-duration: 0.2s;
		display: flex;
		flex-direction: row;
		font-family: CerebriSans-Regular,-apple-system,BlinkMacSystemFont,Roboto,sans-serif;
		text-align: center;
		margin: 5px;
	}

	.result:hover {
		background-color: rgb(48, 223, 173);
		transform: scale(1.1);
	} 

	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
		display: grid;
		place-items: center;
		grid-template-areas: "title"
							 "input"
							 "results";
	}

	h2 {
		color: #F7F7FF;
		text-transform: uppercase;
		font-size: 5em;
		font-weight: 100;
		margin-bottom: 20px;
		margin-top: -10px;
	}

	h3 {
		color: #F7F7FF;
		font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
	}

	.titles {
		display: grid;
		grid-area: title;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>