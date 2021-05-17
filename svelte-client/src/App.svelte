<script>
	let results = "";

	function grab_results() {
		results = "Awaiting search results...";
		fetch("./search")
			.then(returned => returned.text())
			.then(returned => (results = returned));
	}
</script>

<main>
	<h1> Search for a book: </h1>
	<button on:click={grab_results}> Get Results </button>
	<br/>
	<span>{results}</span>
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