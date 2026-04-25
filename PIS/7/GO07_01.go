package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"math"
	"net/http"

	"github.com/gorilla/mux"
)

type RPCRequest struct {
	JSONRPC string          `json:"jsonrpc"`
	Method  string          `json:"method"`
	Params  json.RawMessage `json:"params"`
	ID      *int            `json:"id,omitempty"`
}

type RPCResponse struct {
	JSONRPC string      `json:"jsonrpc"`
	Result  interface{} `json:"result,omitempty"`
	Error   interface{} `json:"error,omitempty"`
	ID      *int        `json:"id,omitempty"`
}

var precision = 2

var logger = log.New(log.Writer(), "[GO07_01] ", log.LstdFlags)

func round(val float64) float64 {
	p := math.Pow(10, float64(precision))
	return math.Round(val*p) / p
}

func parseXY(params json.RawMessage) (float64, float64, error) {

	var arr []float64
	if json.Unmarshal(params, &arr) == nil && len(arr) == 2 {
		return arr[0], arr[1], nil
	}

	var obj struct {
		X float64 `json:"x"`
		Y float64 `json:"y"`
	}
	if json.Unmarshal(params, &obj) == nil && (obj.X != 0 || obj.Y != 0) {
		return obj.X, obj.Y, nil
	}

	return 0, 0, errors.New("invalid params format for x,y")
}

func parseN(params json.RawMessage) (int, error) {
	var obj struct {
		N int `json:"N"`
	}
	if err := json.Unmarshal(params, &obj); err != nil {
		return 0, err
	}
	return obj.N, nil
}

func sum(params json.RawMessage) (float64, error) {
	x, y, err := parseXY(params)
	if err != nil {
		return 0, err
	}
	return round(x + y), nil
}

func sub(params json.RawMessage) (float64, error) {
	x, y, err := parseXY(params)
	if err != nil {
		return 0, err
	}
	return round(x - y), nil
}

func mul(params json.RawMessage) (float64, error) {
	x, y, err := parseXY(params)
	if err != nil {
		return 0, err
	}
	return round(x * y), nil
}

func div(params json.RawMessage) (float64, error) {
	x, y, err := parseXY(params)
	if err != nil {
		return 0, err
	}
	if y == 0 {
		return 0, errors.New("division by zero")
	}
	return round(x / y), nil
}

func pre(params json.RawMessage) string {
	n, err := parseN(params)
	if err != nil {
		return "error"
	}
	precision = n
	return "ok"
}

func rpcHandler(w http.ResponseWriter, r *http.Request) {
	var raw json.RawMessage

	if err := json.NewDecoder(r.Body).Decode(&raw); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}

	// batch?
	if raw[0] == '[' {
		handleBatch(w, raw)
		return
	}

	handleSingle(w, raw)
}

func handleSingle(w http.ResponseWriter, raw json.RawMessage) {
	var req RPCRequest
	if err := json.Unmarshal(raw, &req); err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	logger.Println("method:", req.Method, "params:", string(req.Params))

	if req.ID == nil {
		if req.Method == "pre" {
			res := pre(req.Params)
			logger.Println("notification pre:", res)
		}
		w.WriteHeader(http.StatusNoContent)
		return
	}

	resp := RPCResponse{
		JSONRPC: "2.0",
		ID:      req.ID,
	}

	switch req.Method {
	case "sum":
		r, err := sum(req.Params)
		if err != nil {
			resp.Error = err.Error()
		} else {
			resp.Result = r
		}

	case "sub":
		r, err := sub(req.Params)
		if err != nil {
			resp.Error = err.Error()
		} else {
			resp.Result = r
		}

	case "mul":
		r, err := mul(req.Params)
		if err != nil {
			resp.Error = err.Error()
		} else {
			resp.Result = r
		}

	case "div":
		r, err := div(req.Params)
		if err != nil {
			resp.Error = err.Error()
		} else {
			resp.Result = r
		}

	default:
		resp.Error = "unknown method"
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func handleBatch(w http.ResponseWriter, raw json.RawMessage) {
	var requests []RPCRequest
	if err := json.Unmarshal(raw, &requests); err != nil {
		http.Error(w, "bad batch", http.StatusBadRequest)
		return
	}

	var responses []RPCResponse

	for _, req := range requests {

		logger.Println("batch method:", req.Method)

		if req.ID == nil {
			if req.Method == "pre" {
				logger.Println("batch notification pre:", pre(req.Params))
			}
			continue
		}

		resp := RPCResponse{
			JSONRPC: "2.0",
			ID:      req.ID,
		}

		switch req.Method {
		case "sum":
			r, err := sum(req.Params)
			if err != nil {
				resp.Error = err.Error()
			} else {
				resp.Result = r
			}
		case "sub":
			r, err := sub(req.Params)
			if err != nil {
				resp.Error = err.Error()
			} else {
				resp.Result = r
			}
		case "mul":
			r, err := mul(req.Params)
			if err != nil {
				resp.Error = err.Error()
			} else {
				resp.Result = r
			}
		case "div":
			r, err := div(req.Params)
			if err != nil {
				resp.Error = err.Error()
			} else {
				resp.Result = r
			}
		default:
			resp.Error = "unknown method"
		}

		responses = append(responses, resp)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(responses)
}

func main() {
	r := mux.NewRouter()

	r.HandleFunc("/rpc", rpcHandler).Methods("POST")

	fmt.Println("Server started on :3000")
	log.Fatal(http.ListenAndServe(":3000", r))
}
