# Discord Bot
## Commands

* Notation

  * Any text wrapped with angle brackets indicates your input. The angle brackets are not part of the command.
  * <span style="color: green">An example is \<audio name>. All this says is that this is your input/query to search for the audio. The \< and > are not part of the command.</span>

* Play or queue an audio from YouTube.

  * ```
    $play s="<song name>"
    ```

  * ```
    -play <song name>
    ```

* Show the current queue.

  * ```
    $queue
    ```

* Pause the audio.

  * ```
    $pause
    ```

* Resume the audio.

  * ```
    $resume
    ```

* Skip the current audio and move to the next audio on the queue list.

  * ```
    $next
    ```

* Leave the voice channel. When this command is executed, it removes the current queue.

  * ```
    $leave
    ```

* Cache the current queue and loop it when the current queue is finished. When random is added this command, the order of the audios will be randomized when the current queue finished.

  * ```
    $loop
    ```

  * ```
    $loop random
    ```

* Remove the loop of the queue

  * ```
    $unloop
    ```

* Show the audio that is currently playing.

  * ```
    $currentaudio
    ```

## Predecessor

This bot is the successor of another discord bot I wrote in python.

https://github.com/Jeffreychen1898/DiscordBotLegacy
