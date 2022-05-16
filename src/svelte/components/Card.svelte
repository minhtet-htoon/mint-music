<script lang="ts">
    import "../styles/App.css"
    import { onMount, afterUpdate } from 'svelte';
    import type {IAudioMetadata} from "music-metadata";

    export let data: IAudioMetadata
    export let URL: string
    export let current:boolean

</script>

<div  class={`${current?'border-white border-4 border-solid':''} flex flex-row rounded-lg bg-green-600 w-[40vw]`}>
    <div class="basis-1/4">
        <img id="cover" src= {URL} class="rounded-l-lg aspect-square" alt="album cover">
    </div>
    <div class="basis-3/4 text-center">
        <p class="text-5xl">
            {data.common.title}
        </p>
        <br>
        <p class="text-3xl">
            {data.common.artist} - {data.common.album}
        </p>
    </div>
</div>