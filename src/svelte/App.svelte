<style global lang="postcss">
	@tailwind base;
	@tailwind components;
	@tailwind utilities;
</style>

<script lang="ts">
	// @ts-ignore
	import albumArt from "album-art";
	// @ts-ignore
	import {parse} from 'lyric.js'
	import type {ISong} from "../electron/utils/metaManager";
	import Card from "./components/Card.svelte"
	import "./styles/App.css"
	import {Howl} from 'howler'
	import {ArrowsShuffle, ArrowsRight, PlayerPause, PlayerPlay, PlayerTrackNext, PlayerTrackPrev} from "tabler-icons-svelte";
	import type {ILib} from "../electron/utils/libraryManager";
	import {getArt, shuffle, time} from './utils/misc'
	import {ProgressBar, Tab, TabContent, Tabs, ToastNotification} from "carbon-components-svelte";
	import "carbon-components-svelte/css/g90.css";
	import {quintOut} from "svelte/easing";
	import { slide } from 'svelte/transition';
	import {cue, getLinesAfter, getLinesBefore} from './utils/lyricCue'

	import type {ISettings} from "../electron/utils/electronStore";


	let agree: boolean = false
	let artistN:number = 0
	let files: ISong[] = [];
	let icon: boolean = false;
	let index:number = 0;
	let lib: ILib
	let linesAft:string[] = []
	let linesBef:string[] = []
	let loading = Promise
	let lyricLine = ''
	let lyrics:{
		lines: {
			timestamp:number
			time:string
			content:string
		}[]
	} = {
		lines: [
			{
				timestamp: 0,
				time: '00:00',
				content: ''
			}
		]
	}
	let player:Howl = new Howl({src:['']});
	let settings:ISettings = {
		default: "",
		downloadEnabled: false,
		fadeLength: 0,
		lang: 'en_us',
		onlineFeatures: false,
		settingsMade: false,
		showLyrics:true
	}
	let shuffling:boolean = false
	let queue: ISong[] = [];
	let t = 0;
	let yes: boolean = false

	loading.resolve()
	const timer = setInterval(() => {
		if(queue[index]){
			if( t>=~~queue[index].data.format.duration){
				skip()
			}
			if (queue[index].lyrics){
				lyricLine = cue(t, lyrics)
				console.log(lyricLine)
			}
		}
		if(player && player.playing()){
			t++;
		}
		icon = player.playing()
	},1000);

	function reloadPlayer() {
		t=0
		player.unload()
		player = new Howl({src:[queue[index].path]})
		player.play()
		icon = true
		updateRPC()
		lyricLine = ''
		lyrics = parse(queue[index].lyrics)
		lyrics.lines.unshift({timestamp: 0, time: '00:00.00', content: ''})
		console.log(lyrics)
	}

	function updateRPC (title?:string, details?:string, lgKey?:string, smKey?:string) {
		// @ts-ignore
		window.electronAPI.updateRPC(
				title ? title : queue[index].data.common.title,
				details ? details : `${queue[index].data.common.album} - ${queue[index].data.common.albumartist}`,
				lgKey ? lgKey : 'logo',
				smKey ? smKey : (icon ? 'play' : 'pause'),
				queue[index].data.format.duration - t )
	}

	async function click() {
		//@ts-ignore
		loading = window.electronAPI.openFile()
		files = [...files, ...await loading];
		console.log(files)
		if(shuffling){
			queue = shuffle(queue)
		} else {
			queue = [...files]
		}
		console.log(files)
	}

	function getLength() {
		{
			if(queue[index])
			{
				return queue[index].data.format.duration
			}
			else{
				return 0.1
			}
		}
	}
	function ClickShuffle(){
		shuffling = !shuffling
		if(shuffling){
			queue = [queue[index], ...shuffle(queue.filter(item => item.path !== queue[index].path))]
			index=0
		} else {
			queue = [queue[index], ...files.filter(item => item.path !== queue[index].path)]
			console.log(files.findIndex(file => file.path === queue[index].path))
			index = 0
		}
		console.log(files)
		icon=player.playing()
		updateRPC()
	}
	function skip() {
		index++
		if(index>=queue.length){
			index=0
		}
		reloadPlayer()
	}
	function pause(){
		if(player){
			if (player.playing()){
				player.pause()
			}
			else{
				player.play()
			}
		}
		else{
			player = new Howl({src:[queue[index].path]})
			player.play()
		}
		icon=player.playing()
		updateRPC()
	}
	function back() {
		index--;
		if(index<0){
			index=0
		}
		reloadPlayer()
	}

	function handleMove(e) {
		if (!player) return; // video not loaded yet
		if (e.type !== 'touchmove' && !(e.buttons && 1)) return; // mouse not down

		const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
		const { left, right } = this.getBoundingClientRect();
		t = queue[index].data.format.duration * (clientX - left) / (right - left);
		t=Math.round(t)
		player.seek(t)
	}

	async function folders() {
		// @ts-ignore
		loading = window.electronAPI.openFolder()
		files = [...await loading]
		console.log(files)
		await loading
		if(shuffling){
			queue = shuffle(queue)
		} else {
			queue = [...files]
		}
		console.log(files)
		reloadPlayer()
		// @ts-ignore
		lib = await window.electronAPI.getLib()
	}
	async function testSort() {
		// @ts-ignore
		await window.electronAPI.sort()
		// @ts-ignore
		files = await window.electronAPI.reload()
		console.log(files)
		await loading
		if(shuffling){
			queue = shuffle(queue)
		} else {
			queue = [...files]
		}
		console.log(files)
		reloadPlayer()
		// @ts-ignore
		lib = await window.electronAPI.getLib()
	}
	function mp3Dl() {
		// @ts-ignore
		window.electronAPI.openMp3DL()
	}
</script>

<main>
	<div class="w-full content-center">
		<Tabs autoWidth>
			<Tab label="Main" />
			<Tab label="Library" />
			<Tab label="Playlists" />
			<Tab label="Get New Music"/>
			<Tab label="Settings"/>
			<svelte:fragment slot="content">
<!--				Main Player-->
				<TabContent>
					<button on:click={click}>Load Files</button>
					<br>
					<button on:click={folders}>Load Folder</button>
					<br>
					<button on:click={testSort} disabled={lib===undefined}>Sort</button>
					<br>
					<button on:click={()=>{console.log(queue[index])}}>
						Log Music
					</button>

					{#if queue}
						<div class="flex flex-col space-y-4 content-center items-center">
							{#each queue as file, i}
								<Card data={file.data} current={i===index} URL={file.URL}/>
							{/each}
						</div>
					{/if}
				</TabContent>
<!--				Library-->
				<TabContent>
					{#if (lib)}
						<div class="w-full h-full flex flex-row">
							<div class="float-right h-[90vh] overflow-y-scroll">
								{#each lib.artists as artist, i}
									<a href="javascript:void(0)">
										<div on:click={()=>{artistN=i}} class="flex gap-4 flex-row">
											<div class="basis-1/4">
												{#await albumArt(artist.name)}
												{:then res}
													<img class="aspect-square rounded-full" alt={artist.name} src={res}>
												{:catch err}
													<img class="aspect-square rounded-3xl"
														 src='https://upload.wikimedia.org/wikipedia/commons/b/bc/Juvenile_Ragdoll.jpg'>
												{/await}
											</div>
											<div class="basis-3/4">
												<h1 class="text-3xl">{artist.name}</h1>
											</div>
										</div>
										<div class="h-2"></div>
										<hr>
										<div class="h-2"></div>
									</a>
								{/each}
							</div>
							<div class="basis-3/4 h-[90vh] overflow-y-auto">
								{#each lib.artists[artistN].albums as album}

									<h1>{album.name}</h1>
									<hr>
									<ul>
										{#each album.songs as song}
											<p>{song.name}</p>
										{/each}
									</ul>
								{/each}
							</div>
						</div>
						{:else}
						<p>
							It appears you haven't loaded a library yet. Why no do so?
						</p>
						<button on:click={folders}>Load Library</button>
					{/if}
				</TabContent>
<!--				deemix-->
				<TabContent>
					{#if lib}
						{#each lib.playlists as list}
							<h1>{list.name}</h1>
							<hr>
							<ul>
								{#each list.songs as song}
									<p>{song.name}</p>
								{/each}
							</ul>
						{/each}
						{:else}
						<p>Please load a library to use this feature</p>
						<button on:click={folders}>Load Library</button>
					{/if}
				</TabContent>
				<TabContent>
					{#if agree}
					<button on:click={mp3Dl}>Download mp3s</button>
					<button on:click={()=>{window.electronAPI.openDeemix()}}>Get deemix</button>
						{:else}
						<div class="content-center text-justify container w-[40vw]">
							<div class="h-[40vh] container overflow-y-auto">
								<h1>PLEASE READ CAREFULLY</h1>
								<p>I know you probably hate reading these as much as I hate writing them so I'll keep it
									short </p>
								<p>The services provided in this portion of the app, unless other wise specified, are NOT
									provided by Minhtet Htoon, developers of Mint Music or any open source contributors
									to the project. They were validated to not be malicious on 5/14/2022. THIS COULD
									CHANGE AT ANY TIME.</p>
								<p>NEITHER MINHTET HTOON, OTHER DEVELOPERS NOR ANY CONTRIBUTORS MAYBE HELD RESPONSIBLE
									FOR ANY DAMAGES INCURRED ON YOUR DEVICE AS A RESULT OF USING
									THESES SERVICES. THESE MAY INCLUDE, BUT ARE NOT LIMITED TO, MALWARE, SPYWARE, ADWARE
									AND RANSOMWARE</p>
								<p>Services here are linked under the assumption that they are used in accordance with
									laws in your local jurisdiction.</p>
								<p>NEITHER MINHTET HTOON, OTHER DEVELOPERS NOR ANY CONTRIBUTORS MAYBE HELD RESPONSIBLE
									FOR ANY BREACH OF COPYRIGHT, BREACH OF TRADEMARK OR ANY OTHER LEGAL LIABILITY,
									CRIMINAL OR CIVIL, THAT MAY RESULT FROM IMPROPER USAGE OF THESE SERVICES</p>
								<p><b>USE AT YOUR OWN RISK</b></p>
							</div>
							<div class="table">
								<input bind:checked={yes} class="table-cell" type="checkbox">
								<label class="table-cell whitespace-nowrap pl-2">I accept to the conditions listed above</label>
							</div>
							<button on:click={()=>{agree=true}} disabled={!yes}>Grant access to this portion</button>
						</div>
						{/if}
				</TabContent>
				<TabContent>
					<form>
						<div class="table">
							<input bind:checked={yes} class="table-cell" type="checkbox">
							<label class="table-cell whitespace-nowrap pl-2">I accept to the conditions listed above</label>
						</div>
					</form>
				</TabContent>
			</svelte:fragment>
		</Tabs>
	</div>
	<div class="h-[4vh]"></div>
	<div class="fixed bottom-0 left-0 w-[100%]">
		{#if (queue[index])}
			<div on:click={()=>{settings.showLyrics=!settings.showLyrics}} class="relative right-0 w-96 aspect-square text-center container">
				<img src={queue[index].URL} alt="Album Cover" class={`object-cover w-full h-full ${settings.showLyrics ? 'blur-md': 'blur-none'}`}>
				<div class="absolute table bottom-0 w-full h-full text-green-500">
					{#if settings.showLyrics}
						<p class="align-middle font-bold table-cell text-2xl">{lyricLine}</p>
					{/if}
				</div>
			</div>
		{/if}
		<hr />
		<div class="flex bg-gray-800 pb-4 pt-4 flex-row gap-4">
			<div class="w-6"></div>
			<button on:click={back}><PlayerTrackPrev size="2rem"/></button>
			{#if (icon)}
				<button on:click={pause}><PlayerPause  size="2rem"/></button>
			{:else}
				<button on:click={pause}> <PlayerPlay  size="2rem"/> </button>
			{/if}
			<button on:click={skip}><PlayerTrackNext size="2rem"/></button>
			<button on:click={ClickShuffle}>
				{#if (shuffling)}
					<ArrowsShuffle size="2rem"/>
				{:else}
					<ArrowsRight size="2rem"/>
				{/if}
			</button>
			<div class="w-full h-full pt-3" on:mousemove={handleMove} on:mousedown={player.mute()} on:mouseup={player.mute()}>
				<div class="rounded-3xl w-full bg-gray-200 align-middle object-center h-2">
					<div class="rounded-3xl bg-blue-600 h-full align-middle" style={`width: ${(t/getLength())*100}%`}></div>
				</div>
			</div>
			<p class="pr-4 pt-1.5">
				{time(getLength()-t)}
			</p>
		</div>
	</div>
	{#await loading}
		<div class="fixed top-0 w-96 right-4"
			 transition:slide="{{delay: 250, duration: 300, easing: quintOut }}">
			<ProgressBar
					helperText="Loading..."
			/>
		</div>
	{:catch err}
		<ToastNotification
				title="An Error has occurred"
				subtitle={err.message}
				caption={new Date().toLocaleString()}
				class = 'fixed right-4 bottom-4'
		/>
	{/await}
</main>
