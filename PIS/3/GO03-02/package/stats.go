package P03_02

import (
	"fmt"
	"sync"
)

type Stats struct {
	GetCount  int
	PostCount int
	Mu        sync.Mutex
}

func (s *Stats) PlusGet() {
	s.Mu.Lock()
	s.GetCount++
	s.Mu.Unlock()
}

func (s *Stats) PlusPost() {
	s.Mu.Lock()
	s.PostCount++
	s.Mu.Unlock()
}

func (s *Stats) GenStr() string {
	s.Mu.Lock()
	defer s.Mu.Unlock()
	return fmt.Sprintf("Get-request count = %d, Post-request count = %d",
		s.GetCount, s.PostCount)
}
