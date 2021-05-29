<script>
	let book_name = "";
	let num_results = "";
	let results = [];
	let FLAG_done = "none";

	async function handleSearch(e) {
		// let data = {search: book_name, num: num_results}
		FLAG_done = "searching";
		try {
			const returnValue = await fetch(`/search?term=${JSON.stringify({search: book_name, num: num_results})}`);
			const response = await returnValue.json();
			results = response.data;
			FLAG_done = "found";
			console.log(results)
		} catch (error) {
			console.error("error", error);
		}
	}

</script>

<main>
	<h1>Book Depo</h1>
	<h3> An aggregated search engine for free ebooks online </h3>

	<div id="inputs">
		<h4>Enter the name of the book you are searching for:</h4>
		<input bind:value={book_name}/>
		<br/>
		<br/>
		<h7>Enter the number of results you would like to display: </h7> 
		<br/> <br/>
		<input type=number bind:value={num_results} min=2 max=10>
		<br/>
		<input type=range bind:value={num_results} min=2 max=10>
	</div>

	<br/>
	<button on:click={handleSearch}>Search!</button>

	{#if FLAG_done === "searching"}
		<h3> Searching... </h3>
	{:else}
		<div class="result-view">
			{#each results as result}
				<a href={result.link} target="_blank"> <h4> {result.title} </h4> </a>
			{/each}
		</div>
	{/if}
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>