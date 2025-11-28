package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
)

type PlayerStore interface {
	GetPlayerScore(name string) int
	RecordWin(name string)
	GetAllPlayers() map[string]int
}

type PlayerServer struct {
	store PlayerStore
}

func (p *PlayerServer) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path == "/api/players" && r.Method == http.MethodGet {
		p.getPlayersJSON(w, r)
		return
	}

	if strings.HasPrefix(r.URL.Path, "/players/") {
		player := strings.TrimPrefix(r.URL.Path, "/players/")
		switch r.Method {
		case http.MethodPost:
			p.processWin(w, player)
		case http.MethodGet:
			p.showScore(w, player)
		}
		return
	}

	fs := http.FileServer(http.Dir("./frontend/dist"))
	fs.ServeHTTP(w, r)
}

func (p *PlayerServer) getPlayersJSON(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	players := p.store.GetAllPlayers()
	json.NewEncoder(w).Encode(players)
}

func (p *PlayerServer) showScore(w http.ResponseWriter, player string) {
	score := p.store.GetPlayerScore(player)

	if score == 0 {
		w.WriteHeader(http.StatusNotFound)
	}

	fmt.Fprint(w, score)
}

func (p *PlayerServer) processWin(w http.ResponseWriter, player string) {
	p.store.RecordWin(player)
	w.WriteHeader(http.StatusAccepted)
}
