"use strict";

//--------------------------------------------------------------------------------------------------
// Handler for when the Lock and Start button is pressed
//--------------------------------------------------------------------------------------------------
function OnLockAndStartPressed()
{
	Game.AutoAssignPlayersToTeams();

	// Don't allow a forced start if there are unassigned players
	if ( Game.GetUnassignedPlayerIDs().length > 0  )
		return;

	// Lock the team selection so that no more team changes can be made
	Game.SetTeamSelectionLocked( true );
	
	// Disable the auto start count down
	Game.SetAutoLaunchEnabled( false );

	// Set the remaining time before the game starts
	Game.SetRemainingSetupTime( 4 ); 
}


//--------------------------------------------------------------------------------------------------
// Handler for when the Cancel and Unlock button is pressed
//--------------------------------------------------------------------------------------------------
function OnCancelAndUnlockPressed()
{
	// Unlock the team selection, allowing the players to change teams again
	Game.SetTeamSelectionLocked( false );

	// Stop the countdown timer
	Game.SetRemainingSetupTime( -1 ); 
}

//--------------------------------------------------------------------------------------------------
// Check to see if the local player has host privileges and set the 'player_has_host_privileges' on
// the root panel if so, this allows buttons to only be displayed for the host.
//--------------------------------------------------------------------------------------------------
function CheckForHostPrivileges()
{
	var playerInfo = Game.GetLocalPlayerInfo();
	if ( !playerInfo )
		return;

	// Set the "player_has_host_privileges" class on the panel, this can be used 
	// to have some sub-panels on display or be enabled for the host player.
	$.GetContextPanel().SetHasClass( "player_has_host_privileges", playerInfo.player_has_host_privileges );
}

//--------------------------------------------------------------------------------------------------
// Update the state for the transition timer periodically
//--------------------------------------------------------------------------------------------------
function UpdateTimer()
{
	var gameTime = Game.GetGameTime();
	var transitionTime = Game.GetStateTransitionTime();

	CheckForHostPrivileges();
	
	var mapInfo = Game.GetMapInfo();
	$( "#MapInfo" ).SetDialogVariable( "map_name", mapInfo.map_display_name );

	if ( transitionTime >= 0 )
	{
		$( "#StartGameCountdownTimer" ).SetDialogVariableInt( "countdown_timer_seconds", Math.max( 0, Math.floor( transitionTime - gameTime ) ) );
		$( "#StartGameCountdownTimer" ).SetHasClass( "countdown_active", true );
		$( "#StartGameCountdownTimer" ).SetHasClass( "countdown_inactive", false );
	}
	else
	{
		$( "#StartGameCountdownTimer" ).SetHasClass( "countdown_active", false );
		$( "#StartGameCountdownTimer" ).SetHasClass( "countdown_inactive", true );
	}

	var autoLaunch = Game.GetAutoLaunchEnabled();
	$( "#StartGameCountdownTimer" ).SetHasClass( "auto_start", autoLaunch );
	$( "#StartGameCountdownTimer" ).SetHasClass( "forced_start", ( autoLaunch == false ) );

	// Allow the ui to update its state based on team selection being locked or unlocked
	$.GetContextPanel().SetHasClass( "teams_locked", Game.GetTeamSelectionLocked() );
	$.GetContextPanel().SetHasClass( "teams_unlocked", Game.GetTeamSelectionLocked() == false );
		
	$.Schedule( 0.1, UpdateTimer );
}

function DifficultyUpdate(event_data)
{    
    if ( event_data["difficulty"] == "0" )
	{
        $( "#CustomGameCurrDiffText" ).text="Easy";
	}
	else if (event_data["difficulty"] == "1")
	{
        $( "#CustomGameCurrDiffText" ).text="Medium";
	}
    else if (event_data["difficulty"] == "2")
    {
        $( "#CustomGameCurrDiffText" ).text="Hard";
    }
    else
    {
        $( "#CustomGameCurrDiffText" ).text="Ultra";
    }
}

function OnVoteButtonPressed(category, vote) {    
    //Sending vote data to server's LUA interpreter
	GameEvents.SendCustomGameEventToServer( "setting_vote", { "category":category, "vote":vote } );
}

//--------------------------------------------------------------------------------------------------
// Entry point called when the team select panel is created
//--------------------------------------------------------------------------------------------------
(function()
{
	$( "#TeamSelectContainer" ).SetAcceptsFocus( true ); // Prevents the chat window from taking focus by default

	Game.AutoAssignPlayersToTeams();

	var mapInfo = Game.GetMapInfo();
	$( "#MapInfo" ).SetDialogVariable( "map_name", mapInfo.map_display_name );

	if (mapInfo.map_display_name.indexOf('ultra') !== -1) {
		$( "#CustomGameCurrDiffText" ).text="Ultra";
		$( "#CustomSettingPanel").visible = false;
		$( "#CancelAndUnlockButton").style.display = 'none';
		OnLockAndStartPressed();
	}

	// Start updating the timer, this function will schedule itself to be called periodically
	UpdateTimer();
    
    GameEvents.Subscribe( "info_difficulty", DifficultyUpdate);
})();
